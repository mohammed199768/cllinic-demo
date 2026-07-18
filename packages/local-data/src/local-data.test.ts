// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { ClinicRepository } from './repository';
import { demoSeed, MemorySnapshotStore } from './storage';
import { validateSnapshot } from './validation';
import { clinicRepository } from './index';
import {
  clearDemoSession,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  hasDemoSession,
  localAdminRequest,
  resetLocalData,
} from './admin-adapter';

const bookingInput = (name = 'Test Patient') => ({
  fullName: name,
  phone: '0770000000',
  requestedService: 'General medicine',
  requestedDate: '2026-07-20',
  requestedTime: '10:30',
  source: 'PUBLIC_WEBSITE' as const,
});

const patientInput = (phone = '0770000000') => ({
  firstName: 'Test',
  lastName: 'Patient',
  phone,
  gender: 'UNSPECIFIED' as const,
});

beforeEach(async () => {
  localStorage.clear();
  clearDemoSession();
  await resetLocalData();
});

describe('ClinicRepository release workflows', () => {
  it('initializes from versioned fictional demo seed data', async () => {
    const snapshot = await new ClinicRepository(new MemorySnapshotStore()).snapshot();
    expect(snapshot.schemaVersion).toBe(2);
    expect(snapshot.seedVersion).toMatch(/^\d{4}[.-]\d{2}/);
    expect(snapshot.bookings.length).toBeGreaterThan(0);
    expect(snapshot.patients.length).toBeGreaterThan(0);
  });

  it('persists create and update CRUD operations through the store', async () => {
    const store = new MemorySnapshotStore();
    const first = new ClinicRepository(store);
    const booking = await first.createBooking(bookingInput());
    await first.updateBooking(booking.id, { internalNotes: 'Call before arrival' });

    const reloaded = await new ClinicRepository(store).snapshot();
    expect(reloaded.bookings.find((item) => item.id === booking.id)?.internalNotes).toBe('Call before arrival');
  });

  it('matches a public booking to an existing patient by normalized phone', async () => {
    const repo = new ClinicRepository(new MemorySnapshotStore());
    const patient = await repo.createPatient(patientInput('+962 77 000 0000'));
    const booking = await repo.createBooking(bookingInput());
    const matches = await repo.findPatientMatches(booking.id);
    expect(matches.map((item) => item.id)).toContain(patient.id);
  });

  it('links arrival and converts one booking to exactly one linked visit', async () => {
    const repo = new ClinicRepository(new MemorySnapshotStore());
    const booking = await repo.createBooking(bookingInput());
    const patient = await repo.createPatient(patientInput());
    await repo.linkBooking(booking.id, patient.id);
    await repo.setBookingStatus(booking.id, 'ARRIVED');
    const visit = await repo.convertBookingToVisit(booking.id, patient.id);
    const snapshot = await repo.snapshot();

    expect(snapshot.bookings.find((item) => item.id === booking.id)).toMatchObject({
      patientId: patient.id,
      visitId: visit.id,
      status: 'CONVERTED_TO_VISIT',
    });
    expect(snapshot.visits.filter((item) => item.bookingId === booking.id)).toHaveLength(1);
    await expect(repo.convertBookingToVisit(booking.id, patient.id)).rejects.toThrow(/already been converted/i);
  });

  it('enforces referential integrity during validated import', () => {
    const broken = structuredClone(demoSeed);
    broken.visits[0]!.patientId = 'missing-patient';
    expect(() => validateSnapshot(broken)).toThrow(/invalid patient/i);
  });

  it('derives dashboard and report values from current stored data', async () => {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Amman' }).format(new Date());
    await clinicRepository.createBooking({ ...bookingInput('Derived Data Patient'), requestedDate: today });
    await localAdminRequest('POST', '/api/auth/login', { email: DEMO_EMAIL, password: DEMO_PASSWORD });

    const dashboard = await localAdminRequest<{ counts: { todayBookings: number; newBookings: number } }>('GET', '/api/dashboard/summary');
    const report = await localAdminRequest<{ totals: { scheduledBookings: number } }>('GET', `/api/admin/reports/daily?date=${today}`);
    expect(dashboard.counts.todayBookings).toBeGreaterThanOrEqual(1);
    expect(dashboard.counts.newBookings).toBeGreaterThanOrEqual(1);
    expect(report.totals.scheduledBookings).toBeGreaterThanOrEqual(1);
  });

  it('audit-logs booking, patient, arrival, conversion, and visit updates', async () => {
    const repo = new ClinicRepository(new MemorySnapshotStore());
    const booking = await repo.createBooking(bookingInput());
    const patient = await repo.createPatient(patientInput());
    await repo.setBookingStatus(booking.id, 'ARRIVED');
    const visit = await repo.convertBookingToVisit(booking.id, patient.id);
    await repo.updateVisit(visit.id, { chiefComplaint: 'Demo complaint' });
    const actions = (await repo.snapshot()).activities.map((item) => item.action);
    expect(actions).toEqual(expect.arrayContaining(['CREATE', 'STATUS_CHANGE', 'CONVERT_BOOKING', 'UPDATE']));
  });

  it('creates every clinical entity through secure centralized IDs', async () => {
    const repo = new ClinicRepository(new MemorySnapshotStore());
    const patient = await repo.createPatient(patientInput('0771111111'));
    const condition = await repo.addCondition({ patientId: patient.id, name: 'Controlled asthma', status: 'CONTROLLED' });
    const allergy = await repo.addAllergy({ patientId: patient.id, substance: 'Demo pollen', severity: 'mild' });
    const medication = await repo.addMedication({ patientId: patient.id, name: 'Demo inhaler', active: true });
    const observation = await repo.addObservation({ patientId: patient.id, type: 'TEMPERATURE', valuePrimary: 36.7, unit: '°C' });
    const booking = await repo.createBooking(bookingInput('Clinical ID Patient'));
    await repo.setBookingStatus(booking.id, 'CONFIRMED');
    const visit = await repo.createVisit(patient.id);
    await repo.updateVisit(visit.id, { followUpAt: '2026-08-30T10:00:00.000Z' });
    const item = await repo.addPrescriptionItem(visit.id, { medicationName: 'Demo medicine', dose: '1' });
    const snapshot = await repo.snapshot();
    const prescription = snapshot.prescriptions.find((entry) => entry.visitId === visit.id);

    expect(condition.id).toMatch(/^condition-/);
    expect(allergy.id).toMatch(/^allergy-/);
    expect(medication.id).toMatch(/^medication-/);
    expect(observation.id).toMatch(/^observation-/);
    expect(booking.id).toMatch(/^booking-/);
    expect(visit.id).toMatch(/^visit-/);
    expect(prescription?.id).toMatch(/^prescription-/);
    expect(item.id).toMatch(/^rxitem-/);
    expect(snapshot.visits.find((entry) => entry.id === visit.id)?.followUpAt).toBe('2026-08-30T10:00:00.000Z');
    expect(new Set(snapshot.activities.map((entry) => entry.id)).size).toBe(snapshot.activities.length);
  });

  it('exports and imports a lossless validated JSON round trip', async () => {
    const repo = new ClinicRepository(new MemorySnapshotStore());
    const booking = await repo.createBooking(bookingInput('Round Trip Patient'));
    const exported = await repo.exportJson();
    const target = new ClinicRepository(new MemorySnapshotStore());
    const imported = await target.importJson(exported);
    expect(imported.bookings.some((item) => item.id === booking.id)).toBe(true);
    expect(JSON.parse(await target.exportJson())).toEqual(JSON.parse(exported));
  });

  it('rolls back an invalid import without changing existing data', async () => {
    const repo = new ClinicRepository(new MemorySnapshotStore());
    const booking = await repo.createBooking(bookingInput('Rollback Patient'));
    const before = await repo.exportJson();
    const invalid = JSON.parse(before) as Record<string, unknown>;
    invalid.patients = [];
    await expect(repo.importJson(JSON.stringify(invalid))).rejects.toThrow();
    expect(await repo.exportJson()).toBe(before);
    expect((await repo.snapshot()).bookings.some((item) => item.id === booking.id)).toBe(true);
  });

  it('resets all changes to the original versioned seed', async () => {
    const repo = new ClinicRepository(new MemorySnapshotStore());
    await repo.createBooking(bookingInput('Reset Patient'));
    const reset = await repo.reset();
    expect(reset).toEqual(demoSeed);
  });
});

describe('local demo authentication and shared adapter', () => {
  it('rejects invalid credentials and persists then clears the local session', async () => {
    await expect(localAdminRequest('GET', '/api/bookings')).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' });
    await expect(localAdminRequest('POST', '/api/auth/login', { email: DEMO_EMAIL, password: 'wrong' })).rejects.toMatchObject({ status: 401, code: 'INVALID_CREDENTIALS' });
    await localAdminRequest('POST', '/api/auth/login', { email: DEMO_EMAIL, password: DEMO_PASSWORD });
    expect(hasDemoSession()).toBe(true);
    await localAdminRequest('POST', '/api/auth/logout');
    expect(hasDemoSession()).toBe(false);
  });

  it('shows public-created bookings immediately in admin search on the same origin', async () => {
    await clinicRepository.createBooking(bookingInput('Same Origin Patient'));
    await localAdminRequest('POST', '/api/auth/login', { email: DEMO_EMAIL, password: DEMO_PASSWORD });
    const page = await localAdminRequest<{ data: Array<{ fullName: string }> }>('GET', '/api/bookings?q=Same%20Origin');
    expect(page.data.map((item) => item.fullName)).toContain('Same Origin Patient');
  });
});
