'use client';

import { clinicRepository } from './index';
import type {
  Activity, Booking, BookingInput, BookingStatus, DatabaseSnapshot, Gender, Observation, Patient,
  PatientInput, SubmissionStatus, Visit,
} from './types';

export const DEMO_EMAIL = 'admin@ourclinic.demo';
export const DEMO_PASSWORD = 'OurClinic2026!';
const SESSION_KEY = 'our_clinic_session';
const USER = { id: 'admin-demo', name: 'مدير العيادة', email: DEMO_EMAIL, role: 'ADMIN' as const, lastLoginAt: null };

export class LocalApiError extends Error {
  constructor(public status: number, public code: string, message: string, public fieldErrors?: Record<string, string[]>) {
    super(message);
  }
}

type JsonRecord = Record<string, unknown>;
const record = (value: unknown): JsonRecord => value && typeof value === 'object' ? value as JsonRecord : {};
const text = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback;
const optional = <T>(value: T | undefined | null): T | null => value ?? null;
const fail = (status: number, code: string, message: string): never => { throw new LocalApiError(status, code, message); };
const dateOnly = (value?: string) => value?.slice(0, 10) ?? '';
const nowDate = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Amman' }).format(new Date());
const normalize = (value: string) => value.trim().toLocaleLowerCase('ar').replace(/\s+/g, ' ');
const normalizePhone = (value: string) => value.replace(/\D/g, '').slice(-9);
const age = (dateOfBirth?: string) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(`${dateOfBirth.slice(0, 10)}T00:00:00Z`);
  let years = today.getUTCFullYear() - birth.getUTCFullYear();
  if (today.getUTCMonth() < birth.getUTCMonth() || (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate())) years -= 1;
  return years;
};
const scheduledStart = (booking: Booking) => `${booking.requestedDate}T${booking.requestedTime || '09:00'}:00+03:00`;
const scheduledEnd = (booking: Booking) => new Date(new Date(scheduledStart(booking)).getTime() + booking.durationMinutes * 60_000).toISOString();
const inRange = (value: string | undefined, from: string, to: string) => !!value && dateOnly(value) >= from && dateOnly(value) <= to;

function pageOf<T>(items: T[], url: URL) {
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const pageSize = Math.max(1, Math.min(100, Number(url.searchParams.get('pageSize') ?? 20)));
  const total = items.length;
  return { data: items.slice((page - 1) * pageSize, page * pageSize), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

function patientFor(snapshot: DatabaseSnapshot, id?: string) { return snapshot.patients.find((item) => item.id === id); }
function visitFor(snapshot: DatabaseSnapshot, id?: string) { return snapshot.visits.find((item) => item.id === id); }
function bookingFor(snapshot: DatabaseSnapshot, id?: string) { return snapshot.bookings.find((item) => item.id === id); }
function latestByType(observations: Observation[]) {
  const result: Observation[] = [];
  for (const item of [...observations].sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))) {
    if (!result.some((entry) => entry.type === item.type)) result.push(item);
  }
  return result;
}

function bookingRow(booking: Booking) {
  return {
    ...booking,
    requestedTime: optional(booking.requestedTime),
    patientId: optional(booking.patientId),
  };
}

function visitRow(snapshot: DatabaseSnapshot, visit: Visit) {
  const patient = patientFor(snapshot, visit.patientId);
  const booking = bookingFor(snapshot, visit.bookingId);
  return {
    ...visit,
    patientName: optional(patient?.fullName), medicalRecordNumber: optional(patient?.medicalRecordNumber),
    chiefComplaint: optional(visit.chiefComplaint), followUpAt: optional(visit.followUpAt), bookingReference: optional(booking?.publicReference),
  };
}

function patientDetail(snapshot: DatabaseSnapshot, patient: Patient) {
  const observations = snapshot.observations.filter((item) => item.patientId === patient.id).sort((a, b) => b.measuredAt.localeCompare(a.measuredAt));
  return {
    ...patient,
    middleName: optional(patient.middleName), secondaryPhone: optional(patient.secondaryPhone), dateOfBirth: optional(patient.dateOfBirth),
    age: age(patient.dateOfBirth), bloodType: optional(patient.bloodType), address: optional(patient.address), generalNotes: optional(patient.generalNotes),
    archivedAt: optional(patient.archivedAt),
    conditions: snapshot.conditions.filter((item) => item.patientId === patient.id).map((item) => ({ ...item, diagnosedAt: optional(item.diagnosedAt), notes: optional(item.notes) })),
    allergies: snapshot.allergies.filter((item) => item.patientId === patient.id).map((item) => ({ ...item, reaction: optional(item.reaction), severity: optional(item.severity), notes: optional(item.notes) })),
    medications: snapshot.medications.filter((item) => item.patientId === patient.id).map((item) => ({ ...item, dose: optional(item.dose), unit: optional(item.unit), frequency: optional(item.frequency), route: optional(item.route) })),
    latestObservations: latestByType(observations).map(observationRow), observationHistory: observations.map(observationRow),
    visits: snapshot.visits.filter((item) => item.patientId === patient.id).sort((a, b) => b.visitDate.localeCompare(a.visitDate)).map((item) => ({ ...item, chiefComplaint: optional(item.chiefComplaint), completedAt: optional(item.completedAt) })),
    bookings: snapshot.bookings.filter((item) => item.patientId === patient.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(bookingRow),
  };
}

function observationRow(item: Observation) {
  return { ...item, valueSecondary: optional(item.valueSecondary), context: optional(item.context), notes: optional(item.notes) };
}

function visitDetail(snapshot: DatabaseSnapshot, visit: Visit) {
  const patient = patientFor(snapshot, visit.patientId) ?? fail(404, 'NOT_FOUND', 'Patient not found.');
  const observations = snapshot.observations.filter((item) => item.patientId === patient.id).sort((a, b) => b.measuredAt.localeCompare(a.measuredAt));
  const visitObservations = observations.filter((item) => item.visitId === visit.id);
  const prescription = snapshot.prescriptions.find((item) => item.visitId === visit.id);
  return {
    ...visit,
    chiefComplaint: optional(visit.chiefComplaint), symptoms: optional(visit.symptoms), symptomsStartedAt: optional(visit.symptomsStartedAt),
    medicalHistory: optional(visit.medicalHistory), examinationNotes: optional(visit.examinationNotes), assessment: optional(visit.assessment),
    diagnosisText: optional(visit.diagnosisText), treatmentPlan: optional(visit.treatmentPlan), followUpInstructions: optional(visit.followUpInstructions),
    internalNotes: optional(visit.internalNotes), followUpAt: optional(visit.followUpAt),
    patient: {
      ...patient, age: age(patient.dateOfBirth), bloodType: optional(patient.bloodType),
      conditions: snapshot.conditions.filter((item) => item.patientId === patient.id),
      allergies: snapshot.allergies.filter((item) => item.patientId === patient.id).map((item) => ({ ...item, severity: optional(item.severity) })),
      medications: snapshot.medications.filter((item) => item.patientId === patient.id && item.active).map((item) => ({ ...item, dose: optional(item.dose), frequency: optional(item.frequency) })),
      latestObservations: latestByType(observations).map(observationRow),
    },
    observations: visitObservations.map(observationRow),
    prescription: prescription ? { ...prescription, notes: optional(prescription.notes), items: prescription.items } : null,
  };
}

function groupCount<T>(items: T[], key: (item: T) => string) {
  const counts = new Map<string, number>();
  items.forEach((item) => counts.set(key(item), (counts.get(key(item)) ?? 0) + 1));
  return [...counts].map(([name, count]) => ({ name, count }));
}

function events(snapshot: DatabaseSnapshot, from: string, to: string) {
  return snapshot.activities.filter((item) => inRange(item.createdAt, from, to)).map((item) => ({ id: item.id, eventType: item.action, actorName: item.entityType === 'Submission' || item.entityType === 'Booking' ? null : USER.name, createdAt: item.createdAt }));
}

function report(snapshot: DatabaseSnapshot, from: string, to: string) {
  const scheduled = snapshot.bookings.filter((item) => item.requestedDate >= from && item.requestedDate <= to);
  const createdBookings = snapshot.bookings.filter((item) => inRange(item.createdAt, from, to));
  const createdPatients = snapshot.patients.filter((item) => inRange(item.createdAt, from, to));
  const createdSubmissions = snapshot.submissions.filter((item) => inRange(item.createdAt, from, to));
  const completed = snapshot.visits.filter((item) => item.status === 'COMPLETED' && inRange(item.completedAt, from, to));
  const totals = {
    newBookings: createdBookings.length,
    scheduledBookings: scheduled.length,
    confirmedBookings: scheduled.filter((item) => item.status === 'CONFIRMED').length,
    arrivals: scheduled.filter((item) => ['ARRIVED', 'CONVERTED_TO_VISIT'].includes(item.status)).length,
    noShows: scheduled.filter((item) => item.status === 'NO_SHOW').length,
    cancellations: scheduled.filter((item) => item.status === 'CANCELLED').length,
    convertedToVisits: scheduled.filter((item) => item.status === 'CONVERTED_TO_VISIT').length,
    completedVisits: completed.length,
    newPatients: createdPatients.length,
    childSubmissions: createdSubmissions.filter((item) => item.type === 'CHILD_FORM').length,
    generalMessages: createdSubmissions.filter((item) => item.type === 'GENERAL_MESSAGE').length,
    allSubmissions: createdSubmissions.length,
    relatedPeople: new Set([...scheduled.map((item) => item.patientId), ...completed.map((item) => item.patientId)].filter(Boolean)).size,
  };
  return {
    range: { from, to, timezone: 'Asia/Amman' }, totals,
    bookingStatusBreakdown: groupCount(scheduled, (item) => item.status).map(({ name: status, count }) => ({ status, count })),
    bookingSourceBreakdown: groupCount(scheduled, (item) => item.source).map(({ name: source, count }) => ({ source, count })),
    submissionBreakdown: groupCount(createdSubmissions, (item) => item.type).map(({ name: type, count }) => ({ type, count })),
    attendance: scheduled.filter((item) => ['ARRIVED', 'CONVERTED_TO_VISIT'].includes(item.status)).map((item) => ({ publicReference: item.publicReference, fullName: item.fullName, time: item.requestedTime, status: item.status })),
    noShowList: scheduled.filter((item) => item.status === 'NO_SHOW').map((item) => ({ publicReference: item.publicReference, fullName: item.fullName, time: item.requestedTime })),
    events: events(snapshot, from, to),
    appointments: scheduled.sort((a, b) => a.requestedTime.localeCompare(b.requestedTime)).map((item) => ({ ...bookingRow(item), date: item.requestedDate, time: item.requestedTime, scheduledStartAt: scheduledStart(item) })),
    submissions: createdSubmissions.map((item) => ({ ...item, name: optional(item.name), subject: optional(item.subject) })),
  };
}

export function hasDemoSession() {
  if (typeof window === 'undefined') return false;
  try { return localStorage.getItem(SESSION_KEY) === 'active'; } catch { return false; }
}
function startSession() {
  localStorage.setItem(SESSION_KEY, 'active');
}
export function clearDemoSession() {
  if (typeof window === 'undefined') return;
  for (const key of [SESSION_KEY, 'our_clinic_auth', 'our_clinic_user']) {
    try { localStorage.removeItem(key); } catch { /* unavailable */ }
    try { sessionStorage.removeItem(key); } catch { /* unavailable */ }
  }
}

async function get(path: string, url: URL) {
  if (path === '/api/auth/me') {
    if (!hasDemoSession()) fail(401, 'UNAUTHORIZED', 'Authentication required.');
    return { user: USER };
  }
  if (path === '/api/health') return { status: 'ok', demo: true, storage: 'IndexedDB' };
  if (!hasDemoSession()) fail(401, 'UNAUTHORIZED', 'Authentication required.');
  const snapshot = await clinicRepository.snapshot();

  if (path === '/api/dashboard/summary') {
    const today = nowDate();
    const serviceDistribution = groupCount(snapshot.bookings, (item) => item.requestedService).sort((a, b) => b.count - a.count).slice(0, 5).map(({ name: service, count }) => ({ service, count }));
    const bookingFlow = groupCount(snapshot.bookings, (item) => item.status).map(({ name: status, count }) => ({ status, count }));
    return {
      counts: {
        todayBookings: snapshot.bookings.filter((item) => item.requestedDate === today).length,
        newBookings: snapshot.bookings.filter((item) => item.status === 'NEW').length,
        arrivedBookings: snapshot.bookings.filter((item) => item.status === 'ARRIVED').length,
        openVisits: snapshot.visits.filter((item) => item.status === 'OPEN').length,
        completedVisitsToday: snapshot.visits.filter((item) => item.status === 'COMPLETED' && dateOnly(item.completedAt) === today).length,
        activePatients: snapshot.patients.filter((item) => !item.archivedAt).length,
      },
      recentBookings: [...snapshot.bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map(bookingRow),
      recentVisits: [...snapshot.visits].sort((a, b) => b.visitDate.localeCompare(a.visitDate)).slice(0, 5).map((item) => ({ ...visitRow(snapshot, item), patientName: patientFor(snapshot, item.patientId)?.fullName ?? '' })),
      serviceDistribution, bookingFlow,
      upcomingFollowUps: snapshot.visits.filter((item) => item.followUpAt).sort((a, b) => (a.followUpAt ?? '').localeCompare(b.followUpAt ?? '')).slice(0, 5).map((item) => ({ visitId: item.id, patientId: item.patientId, patientName: patientFor(snapshot, item.patientId)?.fullName ?? '', visitNumber: item.visitNumber, followUpAt: item.followUpAt! })),
    };
  }

  if (path === '/api/bookings') {
    let items = [...snapshot.bookings];
    const status = url.searchParams.get('status'); const q = normalize(url.searchParams.get('q') ?? ''); const linked = url.searchParams.get('linked');
    const date = url.searchParams.get('date'); const from = url.searchParams.get('from'); const to = url.searchParams.get('to');
    if (status) items = items.filter((item) => item.status === status);
    if (q) items = items.filter((item) => normalize(`${item.fullName} ${item.phone} ${item.publicReference} ${item.requestedService}`).includes(q));
    if (linked === 'linked') items = items.filter((item) => item.patientId); if (linked === 'unlinked') items = items.filter((item) => !item.patientId);
    if (date) items = items.filter((item) => item.requestedDate === date); if (from) items = items.filter((item) => item.requestedDate >= from); if (to) items = items.filter((item) => item.requestedDate <= to);
    items.sort((a, b) => `${b.requestedDate}${b.requestedTime}`.localeCompare(`${a.requestedDate}${a.requestedTime}`));
    return pageOf(items.map(bookingRow), url);
  }

  const bookingMatch = path.match(/^\/api\/bookings\/([^/]+)(?:\/(matches|history))?$/);
  if (bookingMatch) {
    const booking = bookingFor(snapshot, bookingMatch[1]!) ?? fail(404, 'NOT_FOUND', 'Booking not found.');
    if (bookingMatch[2] === 'matches') {
      const matches = await clinicRepository.findPatientMatches(booking.id);
      return { matches: matches.map((patient) => ({ patientId: patient.id, medicalRecordNumber: patient.medicalRecordNumber, fullName: patient.fullName, phone: patient.phone, dateOfBirth: optional(patient.dateOfBirth), lastVisitAt: optional(snapshot.visits.filter((item) => item.patientId === patient.id).sort((a, b) => b.visitDate.localeCompare(a.visitDate))[0]?.visitDate), reasonCode: normalizePhone(patient.phone) === normalizePhone(booking.phone) ? 'EXACT_PHONE' : 'SIMILAR_NAME', reasonLabelEn: normalizePhone(patient.phone) === normalizePhone(booking.phone) ? 'Exact phone' : 'Similar name', reasonLabelAr: normalizePhone(patient.phone) === normalizePhone(booking.phone) ? 'تطابق رقم الهاتف' : 'اسم مشابه', strength: normalizePhone(patient.phone) === normalizePhone(booking.phone) ? 'strong' : 'medium' })) };
    }
    if (bookingMatch[2] === 'history') return { data: snapshot.activities.filter((item) => item.entityId === booking.id).map((item) => ({ id: item.id, eventType: item.action, actorName: item.action === 'CREATE' && booking.source === 'PUBLIC_WEBSITE' ? null : USER.name, createdAt: item.createdAt })) };
    const patient = patientFor(snapshot, booking.patientId); const visit = visitFor(snapshot, booking.visitId);
    return { ...bookingRow(booking), message: optional(booking.message), internalNotes: optional(booking.internalNotes), scheduledStartAt: scheduledStart(booking), scheduledEndAt: scheduledEnd(booking), patient: patient ? { id: patient.id, medicalRecordNumber: patient.medicalRecordNumber, fullName: patient.fullName, phone: patient.phone } : null, visit: visit ? { id: visit.id, visitNumber: visit.visitNumber, status: visit.status } : null };
  }

  if (path === '/api/patients') {
    let items = [...snapshot.patients]; const q = normalize(url.searchParams.get('q') ?? ''); const status = url.searchParams.get('status') ?? 'active';
    if (q) items = items.filter((item) => normalize(`${item.fullName} ${item.phone} ${item.medicalRecordNumber}`).includes(q));
    if (status === 'active') items = items.filter((item) => !item.archivedAt); if (status === 'archived') items = items.filter((item) => item.archivedAt);
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return pageOf(items.map((patient) => { const visits = snapshot.visits.filter((item) => item.patientId === patient.id); return { ...patient, dateOfBirth: optional(patient.dateOfBirth), age: age(patient.dateOfBirth), lastVisitAt: optional(visits.sort((a, b) => b.visitDate.localeCompare(a.visitDate))[0]?.visitDate), openVisits: visits.filter((item) => item.status === 'OPEN').length, archivedAt: optional(patient.archivedAt) }; }), url);
  }
  const patientMatch = path.match(/^\/api\/patients\/([^/]+)$/);
  if (patientMatch) { const patient = patientFor(snapshot, patientMatch[1]!) ?? fail(404, 'NOT_FOUND', 'Patient not found.'); return patientDetail(snapshot, patient); }

  if (path === '/api/visits') {
    let items = [...snapshot.visits]; const status = url.searchParams.get('status'); const q = normalize(url.searchParams.get('q') ?? ''); const followUp = url.searchParams.get('followUp') ?? 'all';
    if (status) items = items.filter((item) => item.status === status);
    if (followUp === 'due') items = items.filter((item) => item.followUpAt && item.followUpAt.slice(0, 10) <= nowDate());
    if (followUp === 'scheduled') items = items.filter((item) => item.followUpAt);
    if (q) items = items.filter((item) => { const patient = patientFor(snapshot, item.patientId); return normalize(`${item.visitNumber} ${item.chiefComplaint ?? ''} ${patient?.fullName ?? ''} ${patient?.medicalRecordNumber ?? ''}`).includes(q); });
    const ascending = url.searchParams.get('order') === 'asc'; items.sort((a, b) => (ascending ? 1 : -1) * a.visitDate.localeCompare(b.visitDate));
    return pageOf(items.map((item) => visitRow(snapshot, item)), url);
  }
  const visitMatch = path.match(/^\/api\/visits\/([^/]+)$/);
  if (visitMatch) { const visit = visitFor(snapshot, visitMatch[1]!) ?? fail(404, 'NOT_FOUND', 'Visit not found.'); return visitDetail(snapshot, visit); }

  if (path === '/api/audit') {
    let items = [...snapshot.activities]; const action = url.searchParams.get('action'); const q = normalize(url.searchParams.get('q') ?? '');
    if (action) items = items.filter((item) => item.action === action); if (q) items = items.filter((item) => normalize(`${item.descriptionAr} ${item.descriptionEn} ${item.entityType}`).includes(q));
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return pageOf(items.map((item) => ({ ...item, entityId: optional(item.entityId), description: item.descriptionAr, admin: item.entityType === 'Submission' ? null : USER.name })), url);
  }

  if (path === '/api/admin/submissions') {
    let items = [...snapshot.submissions]; const type = url.searchParams.get('type'); const status = url.searchParams.get('status'); const q = normalize(url.searchParams.get('q') ?? ''); const from = url.searchParams.get('from'); const to = url.searchParams.get('to');
    if (type) items = items.filter((item) => item.type === type); if (status) items = items.filter((item) => item.status === status);
    if (q) items = items.filter((item) => normalize(`${item.name ?? ''} ${item.phone ?? ''} ${item.email ?? ''} ${item.subject ?? ''} ${item.message ?? ''}`).includes(q));
    if (from) items = items.filter((item) => dateOnly(item.createdAt) >= from); if (to) items = items.filter((item) => dateOnly(item.createdAt) <= to);
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { ...pageOf(items.map((item) => ({ ...item, name: optional(item.name), phone: optional(item.phone), email: optional(item.email), subject: optional(item.subject) })), url), newCount: snapshot.submissions.filter((item) => item.status === 'NEW').length };
  }
  const submissionMatch = path.match(/^\/api\/admin\/submissions\/([^/]+)$/);
  if (submissionMatch) { const item = snapshot.submissions.find((entry) => entry.id === submissionMatch[1]!) ?? fail(404, 'NOT_FOUND', 'Submission not found.'); return { ...item, name: optional(item.name), phone: optional(item.phone), email: optional(item.email), subject: optional(item.subject), message: optional(item.message), internalNote: optional(item.internalNote), payload: item.payload ?? {} }; }

  if (path === '/api/admin/reports/daily') { const date = url.searchParams.get('date') ?? nowDate(); return report(snapshot, date, date); }
  if (path === '/api/admin/reports/range') { const from = url.searchParams.get('from') ?? nowDate(); const to = url.searchParams.get('to') ?? from; return report(snapshot, from, to); }
  fail(404, 'NOT_FOUND', `Local endpoint not found: ${path}`);
}

async function mutate(method: string, path: string, input: unknown) {
  const body = record(input);
  if (path === '/api/auth/login' && method === 'POST') {
    if (text(body.email).toLowerCase() !== DEMO_EMAIL || text(body.password) !== DEMO_PASSWORD) fail(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    startSession(); return { user: USER };
  }
  if (path === '/api/auth/logout' && method === 'POST') { clearDemoSession(); return undefined; }
  if (!hasDemoSession()) fail(401, 'UNAUTHORIZED', 'Authentication required.');

  if (path === '/api/bookings' && method === 'POST') {
    const booking = await clinicRepository.createBooking({ fullName: text(body.fullName), phone: text(body.phone), requestedService: text(body.requestedService), requestedDate: text(body.requestedDate), requestedTime: text(body.requestedTime, '09:00'), durationMinutes: Number(body.durationMinutes ?? 30), source: (body.source === 'PUBLIC_WEBSITE' ? 'PUBLIC_WEBSITE' : 'ADMIN'), message: text(body.message) || undefined, internalNotes: text(body.internalNotes) || undefined });
    return bookingRow(booking);
  }
  const updateBookingMatch = path.match(/^\/api\/bookings\/([^/]+)$/);
  if (updateBookingMatch && method === 'PATCH') return clinicRepository.updateBooking(updateBookingMatch[1]!, body as Partial<BookingInput>);
  const statusMatch = path.match(/^\/api\/bookings\/([^/]+)\/status$/);
  if (statusMatch && method === 'PATCH') return clinicRepository.setBookingStatus(statusMatch[1]!, text(body.status) as BookingStatus);
  const arriveMatch = path.match(/^\/api\/bookings\/([^/]+)\/arrive$/);
  if (arriveMatch && method === 'POST') return clinicRepository.setBookingStatus(arriveMatch[1]!, 'ARRIVED');
  const linkMatch = path.match(/^\/api\/bookings\/([^/]+)\/link-patient$/);
  if (linkMatch && method === 'POST') return clinicRepository.linkBooking(linkMatch[1]!, text(body.patientId));
  const convertMatch = path.match(/^\/api\/bookings\/([^/]+)\/convert-to-visit$/);
  if (convertMatch && method === 'POST') {
    let patientId = text(body.existingPatientId);
    if (body.patientMode === 'create') {
      const value = record(body.newPatient);
      const patient = await clinicRepository.createPatient({ firstName: text(value.firstName), middleName: text(value.middleName) || undefined, lastName: text(value.lastName), phone: text(value.phone), dateOfBirth: text(value.dateOfBirth) || undefined, gender: text(value.gender, 'UNSPECIFIED') as Gender });
      patientId = patient.id;
    }
    if (!patientId) fail(400, 'VALIDATION_ERROR', 'Choose or create a patient.');
    const snapshot = await clinicRepository.snapshot(); const booking = bookingFor(snapshot, convertMatch[1]!) ?? fail(404, 'NOT_FOUND', 'Booking not found.');
    if (booking.status === 'NEW' || booking.status === 'CONFIRMED') await clinicRepository.setBookingStatus(booking.id, 'ARRIVED');
    const visit = await clinicRepository.convertBookingToVisit(booking.id, patientId); return { visitId: visit.id };
  }

  if (path === '/api/patients' && method === 'POST') {
    const snapshot = await clinicRepository.snapshot();
    const duplicate = snapshot.patients.some((item) => normalizePhone(item.phone) === normalizePhone(text(body.phone)) && normalize(item.fullName) === normalize([body.firstName, body.middleName, body.lastName].filter(Boolean).join(' ')));
    if (duplicate && body.confirmDuplicate !== true) fail(409, 'DUPLICATE', 'A matching patient already exists.');
    const patient = await clinicRepository.createPatient({ firstName: text(body.firstName), middleName: text(body.middleName) || undefined, lastName: text(body.lastName), phone: text(body.phone), secondaryPhone: text(body.secondaryPhone) || undefined, dateOfBirth: text(body.dateOfBirth) || undefined, gender: text(body.gender, 'UNSPECIFIED') as Gender, bloodType: text(body.bloodType) || undefined, address: text(body.address) || undefined, emergencyContactName: text(body.emergencyContactName) || undefined, emergencyContactPhone: text(body.emergencyContactPhone) || undefined, generalNotes: text(body.generalNotes) || undefined });
    return patient;
  }
  const patientUpdate = path.match(/^\/api\/patients\/([^/]+)$/);
  if (patientUpdate && method === 'PATCH') return clinicRepository.updatePatient(patientUpdate[1]!, body as Partial<PatientInput>);
  const related = path.match(/^\/api\/patients\/([^/]+)\/(conditions|allergies|medications|observations)$/);
  if (related && method === 'POST') {
    const patientId = related[1]!;
    if (related[2] === 'conditions') return clinicRepository.addCondition({ patientId, name: text(body.name), status: text(body.status, 'ACTIVE') as 'ACTIVE', diagnosedAt: text(body.diagnosedAt) || undefined, notes: text(body.notes) || undefined });
    if (related[2] === 'allergies') return clinicRepository.addAllergy({ patientId, substance: text(body.substance), reaction: text(body.reaction) || undefined, severity: text(body.severity) || undefined, notes: text(body.notes) || undefined });
    if (related[2] === 'medications') return clinicRepository.addMedication({ patientId, name: text(body.name), dose: text(body.dose) || undefined, unit: text(body.unit) || undefined, frequency: text(body.frequency) || undefined, route: text(body.route) || undefined, notes: text(body.notes) || undefined, active: body.active !== false });
    return clinicRepository.addObservation({ patientId, visitId: text(body.visitId) || undefined, type: text(body.type) as Observation['type'], valuePrimary: Number(body.valuePrimary), valueSecondary: body.valueSecondary === undefined ? undefined : Number(body.valueSecondary), unit: text(body.unit), context: text(body.context) || undefined, notes: text(body.notes) || undefined });
  }
  const relatedDelete = path.match(/^\/api\/(conditions|allergies|medications|observations)\/([^/]+)$/);
  if (relatedDelete && method === 'DELETE') return clinicRepository.removeRelated(relatedDelete[1]! as 'conditions' | 'allergies' | 'medications' | 'observations', relatedDelete[2]!);
  const medicationPatch = path.match(/^\/api\/medications\/([^/]+)$/);
  if (medicationPatch && method === 'PATCH') return clinicRepository.setMedicationActive(medicationPatch[1]!, body.active === true);

  const visitUpdate = path.match(/^\/api\/visits\/([^/]+)$/);
  if (visitUpdate && method === 'PATCH') return clinicRepository.updateVisit(visitUpdate[1]!, body);
  const visitComplete = path.match(/^\/api\/visits\/([^/]+)\/complete$/);
  if (visitComplete && method === 'POST') return clinicRepository.completeVisit(visitComplete[1]!);
  const visitReopen = path.match(/^\/api\/visits\/([^/]+)\/reopen$/);
  if (visitReopen && method === 'POST') return clinicRepository.reopenVisit(visitReopen[1]!, text(body.reason));
  const prescription = path.match(/^\/api\/visits\/([^/]+)\/prescription$/);
  if (prescription && method === 'PUT') return clinicRepository.updatePrescriptionNotes(prescription[1]!, text(body.notes) || undefined);
  const prescriptionItem = path.match(/^\/api\/visits\/([^/]+)\/prescription\/items$/);
  if (prescriptionItem && method === 'POST') return clinicRepository.addPrescriptionItem(prescriptionItem[1]!, { medicationName: text(body.medicationName), dose: text(body.dose) || undefined, unit: text(body.unit) || undefined, route: text(body.route) || undefined, frequency: text(body.frequency) || undefined, duration: text(body.duration) || undefined, instructions: text(body.instructions) || undefined });
  const prescriptionDelete = path.match(/^\/api\/prescription-items\/([^/]+)$/);
  if (prescriptionDelete && method === 'DELETE') return clinicRepository.removePrescriptionItem(prescriptionDelete[1]!);
  const submission = path.match(/^\/api\/admin\/submissions\/([^/]+)$/);
  if (submission && method === 'PATCH') return clinicRepository.updateSubmission(submission[1]!, text(body.status) as SubmissionStatus, text(body.internalNote) || undefined);
  fail(404, 'NOT_FOUND', `Local mutation not found: ${method} ${path}`);
}

export async function localAdminRequest<T>(method: string, requestPath: string, input?: unknown): Promise<T> {
  try {
    const url = new URL(requestPath, 'https://ourclinic.local');
    const result = method === 'GET' ? await get(url.pathname, url) : await mutate(method, url.pathname, input);
    return result as T;
  } catch (error) {
    if (error instanceof LocalApiError) throw error;
    throw new LocalApiError(400, 'LOCAL_DATA_ERROR', error instanceof Error ? error.message : 'Local data operation failed.');
  }
}

export async function exportLocalData() { return clinicRepository.exportJson(); }
export async function importLocalData(value: string) { return clinicRepository.importJson(value); }
export async function resetLocalData() { return clinicRepository.reset(); }
