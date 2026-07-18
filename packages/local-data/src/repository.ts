import type {
  Allergy, Booking, BookingInput, BookingStatus, Condition, DatabaseSnapshot, Medication, Observation,
  Patient, PatientInput, Prescription, PrescriptionItem, Submission, SubmissionStatus, Visit, VisitPatch,
} from './types';
import type { SnapshotStore } from './storage';
import { validateSnapshot } from './validation';
import { createId } from './utils/create-id';

const now = () => new Date().toISOString();
const normalizePhone = (phone: string) => phone.replace(/\D/g, '').slice(-9);
const normalize = (value: string) => value.trim().toLocaleLowerCase('ar').replace(/\s+/g, ' ');
const ref = (prefix: string, counter: number) => `${prefix}-${new Date().getFullYear()}-${String(counter).padStart(6, '0')}`;

export class ClinicRepository {
  constructor(
    private readonly store: SnapshotStore,
    private readonly idFactory: () => string = createId,
  ) {}

  private uid(prefix: string) { return `${prefix}-${this.idFactory()}`; }

  async snapshot() { return this.store.read(); }
  private async mutate<T>(work: (data: DatabaseSnapshot) => T): Promise<T> {
    const data = await this.store.read();
    const result = work(data);
    await this.store.write(data);
    return result;
  }
  async mutateSnapshot<T>(work: (data: DatabaseSnapshot) => T): Promise<T> { return this.mutate(work); }
  private activity(data: DatabaseSnapshot, action: string, entityType: string, entityId: string | undefined, ar: string, en: string) {
    data.activities.unshift({ id: this.uid('activity'), action, entityType, entityId, descriptionAr: ar, descriptionEn: en, createdAt: now() });
  }

  async createBooking(input: BookingInput): Promise<Booking> {
    if (input.fullName.trim().length < 2) throw new Error('Full name must contain at least two characters.');
    if (normalizePhone(input.phone).length < 7) throw new Error('Enter a valid phone number.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.requestedDate)) throw new Error('Choose a valid appointment date.');
    return this.mutate((data) => {
      data.counters.booking += 1;
      const stamp = now();
      const booking: Booking = {
        id: this.uid('booking'), publicReference: ref('BK', data.counters.booking), fullName: input.fullName.trim(), phone: input.phone.trim(),
        requestedService: input.requestedService.trim(), requestedDate: input.requestedDate, requestedTime: input.requestedTime,
        durationMinutes: input.durationMinutes ?? 30, location: input.location ?? 'clinic', relation: input.relation, ageGroup: input.ageGroup,
        requestedGender: input.requestedGender, insurance: input.insurance, urgency: input.urgency, address: input.address?.trim() || undefined,
        arrivalNotes: input.arrivalNotes?.trim() || undefined, source: input.source ?? 'PUBLIC_WEBSITE',
        status: 'NEW', message: input.message?.trim() || undefined, internalNotes: input.internalNotes?.trim() || undefined, createdAt: stamp, updatedAt: stamp,
      };
      data.bookings.unshift(booking);
      this.activity(data, 'CREATE', 'Booking', booking.id, `تم إنشاء الحجز ${booking.publicReference}`, `Booking ${booking.publicReference} created`);
      return booking;
    });
  }

  async updateBooking(id: string, patch: Partial<BookingInput>): Promise<Booking> {
    return this.mutate((data) => {
      const booking = data.bookings.find((item) => item.id === id);
      if (!booking) throw new Error('Booking not found.');
      Object.assign(booking, Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)), { updatedAt: now() });
      this.activity(data, 'UPDATE', 'Booking', id, `تم تحديث الحجز ${booking.publicReference}`, `Booking ${booking.publicReference} updated`);
      return booking;
    });
  }

  async setBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
    return this.mutate((data) => {
      const booking = data.bookings.find((item) => item.id === id);
      if (!booking) throw new Error('Booking not found.');
      if (booking.status === 'CONVERTED_TO_VISIT' && status !== 'CONVERTED_TO_VISIT') throw new Error('A converted booking cannot change status.');
      booking.status = status; booking.updatedAt = now();
      if (status === 'ARRIVED') booking.arrivedAt = now();
      this.activity(data, 'STATUS_CHANGE', 'Booking', id, `تغيّرت حالة ${booking.publicReference} إلى ${status}`, `${booking.publicReference} status changed to ${status}`);
      return booking;
    });
  }

  async linkBooking(id: string, patientId: string): Promise<Booking> {
    return this.mutate((data) => {
      const booking = data.bookings.find((item) => item.id === id);
      if (!booking) throw new Error('Booking not found.');
      if (!data.patients.some((item) => item.id === patientId)) throw new Error('Patient not found.');
      booking.patientId = patientId; booking.updatedAt = now();
      this.activity(data, 'UPDATE', 'Booking', id, `تم ربط الحجز بملف مريض`, 'Booking linked to patient');
      return booking;
    });
  }

  async createPatient(input: PatientInput): Promise<Patient> {
    if (!input.firstName.trim() || !input.lastName.trim()) throw new Error('First and last name are required.');
    if (normalizePhone(input.phone).length < 7) throw new Error('Enter a valid phone number.');
    return this.mutate((data) => {
      data.counters.patient += 1;
      const stamp = now();
      const patient: Patient = {
        ...input, id: this.uid('patient'), medicalRecordNumber: ref('MR', data.counters.patient),
        firstName: input.firstName.trim(), middleName: input.middleName?.trim() || undefined, lastName: input.lastName.trim(),
        fullName: [input.firstName, input.middleName, input.lastName].filter(Boolean).join(' '), phone: input.phone.trim(), createdAt: stamp, updatedAt: stamp,
      };
      data.patients.unshift(patient);
      this.activity(data, 'CREATE', 'Patient', patient.id, `تم إنشاء ملف ${patient.medicalRecordNumber}`, `Patient ${patient.medicalRecordNumber} created`);
      return patient;
    });
  }

  async updatePatient(id: string, patch: Partial<PatientInput>): Promise<Patient> {
    return this.mutate((data) => {
      const patient = data.patients.find((item) => item.id === id);
      if (!patient) throw new Error('Patient not found.');
      Object.assign(patient, Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)));
      patient.fullName = [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' '); patient.updatedAt = now();
      this.activity(data, 'UPDATE', 'Patient', id, `تم تحديث ${patient.medicalRecordNumber}`, `Patient ${patient.medicalRecordNumber} updated`);
      return patient;
    });
  }

  async setPatientArchived(id: string, archived: boolean): Promise<Patient> {
    return this.mutate((data) => {
      const patient = data.patients.find((item) => item.id === id);
      if (!patient) throw new Error('Patient not found.');
      patient.archivedAt = archived ? now() : undefined; patient.updatedAt = now();
      this.activity(data, archived ? 'ARCHIVE' : 'RESTORE', 'Patient', id, archived ? `تمت أرشفة ${patient.medicalRecordNumber}` : `تمت استعادة ${patient.medicalRecordNumber}`, archived ? `Patient ${patient.medicalRecordNumber} archived` : `Patient ${patient.medicalRecordNumber} restored`);
      return patient;
    });
  }

  async findPatientMatches(bookingId: string): Promise<Patient[]> {
    const data = await this.store.read();
    const booking = data.bookings.find((item) => item.id === bookingId);
    if (!booking) return [];
    const phone = normalizePhone(booking.phone); const name = normalize(booking.fullName);
    return data.patients.filter((patient) => normalizePhone(patient.phone) === phone || normalize(patient.fullName).includes(name) || name.includes(normalize(patient.fullName)));
  }

  async convertBookingToVisit(bookingId: string, patientId: string): Promise<Visit> {
    return this.mutate((data) => {
      const booking = data.bookings.find((item) => item.id === bookingId);
      if (!booking) throw new Error('Booking not found.');
      if (booking.visitId || data.visits.some((item) => item.bookingId === bookingId)) throw new Error('This booking has already been converted to a visit.');
      if (booking.status !== 'ARRIVED') throw new Error('Mark the booking as arrived before conversion.');
      if (!data.patients.some((item) => item.id === patientId)) throw new Error('Patient not found.');
      data.counters.visit += 1; const stamp = now();
      const visit: Visit = { id: this.uid('visit'), visitNumber: ref('VS', data.counters.visit), patientId, bookingId, status: 'OPEN', visitDate: stamp, createdAt: stamp, updatedAt: stamp };
      data.visits.unshift(visit); booking.patientId = patientId; booking.visitId = visit.id; booking.status = 'CONVERTED_TO_VISIT'; booking.convertedAt = stamp; booking.updatedAt = stamp;
      this.activity(data, 'CONVERT_BOOKING', 'Visit', visit.id, `تم تحويل ${booking.publicReference} إلى ${visit.visitNumber}`, `${booking.publicReference} converted to ${visit.visitNumber}`);
      return visit;
    });
  }

  async createVisit(patientId: string): Promise<Visit> {
    return this.mutate((data) => {
      if (!data.patients.some((item) => item.id === patientId)) throw new Error('Patient not found.');
      data.counters.visit += 1; const stamp = now();
      const visit: Visit = { id: this.uid('visit'), visitNumber: ref('VS', data.counters.visit), patientId, status: 'OPEN', visitDate: stamp, createdAt: stamp, updatedAt: stamp };
      data.visits.unshift(visit); this.activity(data, 'CREATE', 'Visit', visit.id, `تم إنشاء ${visit.visitNumber}`, `Visit ${visit.visitNumber} created`); return visit;
    });
  }

  async updateVisit(id: string, patch: VisitPatch): Promise<Visit> {
    return this.mutate((data) => {
      const visit = data.visits.find((item) => item.id === id); if (!visit) throw new Error('Visit not found.');
      Object.assign(visit, patch, { updatedAt: now() }); this.activity(data, 'UPDATE', 'Visit', id, `تم حفظ ${visit.visitNumber}`, `Visit ${visit.visitNumber} saved`); return visit;
    });
  }

  async completeVisit(id: string): Promise<Visit> {
    return this.mutate((data) => {
      const visit = data.visits.find((item) => item.id === id); if (!visit) throw new Error('Visit not found.');
      if (visit.status !== 'OPEN') throw new Error('Only an open visit can be completed.');
      visit.status = 'COMPLETED'; visit.completedAt = now(); visit.updatedAt = now();
      this.activity(data, 'COMPLETE_VISIT', 'Visit', id, `تم إكمال ${visit.visitNumber}`, `Visit ${visit.visitNumber} completed`); return visit;
    });
  }

  async reopenVisit(id: string, reason: string): Promise<Visit> {
    if (reason.trim().length < 3) throw new Error('A reopening reason is required.');
    return this.mutate((data) => {
      const visit = data.visits.find((item) => item.id === id); if (!visit) throw new Error('Visit not found.');
      if (visit.status !== 'COMPLETED') throw new Error('Only a completed visit can be reopened.');
      visit.status = 'OPEN'; visit.reopenedReason = reason.trim(); visit.completedAt = undefined; visit.updatedAt = now();
      this.activity(data, 'RESTORE', 'Visit', id, `أعيد فتح ${visit.visitNumber}: ${reason}`, `Visit ${visit.visitNumber} reopened: ${reason}`); return visit;
    });
  }

  async addObservation(input: Omit<Observation, 'id' | 'measuredAt'>): Promise<Observation> {
    return this.mutate((data) => {
      if (!data.patients.some((item) => item.id === input.patientId)) throw new Error('Patient not found.');
      const item: Observation = { ...input, id: this.uid('observation'), measuredAt: now() }; data.observations.unshift(item);
      this.activity(data, 'CREATE', 'Observation', item.id, 'تمت إضافة قياس', 'Measurement added'); return item;
    });
  }

  async savePrescription(visitId: string, notes: string, items: Omit<PrescriptionItem, 'id'>[]): Promise<Prescription> {
    return this.mutate((data) => {
      if (!data.visits.some((item) => item.id === visitId)) throw new Error('Visit not found.');
      let rx = data.prescriptions.find((item) => item.visitId === visitId);
      const stamp = now();
      if (!rx) { rx = { id: this.uid('prescription'), visitId, notes, items: [], updatedAt: stamp }; data.prescriptions.push(rx); }
      rx.notes = notes.trim() || undefined; rx.items = items.filter((item) => item.medicationName.trim()).map((item) => ({ ...item, id: this.uid('rxitem'), medicationName: item.medicationName.trim() })); rx.updatedAt = stamp;
      this.activity(data, 'UPDATE', 'Prescription', rx.id, 'تم حفظ الوصفة', 'Prescription saved'); return rx;
    });
  }

  async updatePrescriptionNotes(visitId: string, notes?: string): Promise<Prescription> {
    return this.mutate((data) => {
      if (!data.visits.some((item) => item.id === visitId)) throw new Error('Visit not found.');
      let prescription = data.prescriptions.find((item) => item.visitId === visitId);
      if (!prescription) {
        prescription = { id: this.uid('prescription'), visitId, items: [], updatedAt: now() };
        data.prescriptions.push(prescription);
      }
      prescription.notes = notes?.trim() || undefined;
      prescription.updatedAt = now();
      this.activity(data, 'UPDATE', 'Prescription', prescription.id, 'تم حفظ ملاحظات الوصفة', 'Prescription notes saved');
      return prescription;
    });
  }

  async addPrescriptionItem(visitId: string, input: Omit<PrescriptionItem, 'id'>): Promise<PrescriptionItem> {
    if (!input.medicationName.trim()) throw new Error('Medication name is required.');
    return this.mutate((data) => {
      if (!data.visits.some((item) => item.id === visitId)) throw new Error('Visit not found.');
      let prescription = data.prescriptions.find((item) => item.visitId === visitId);
      if (!prescription) {
        prescription = { id: this.uid('prescription'), visitId, items: [], updatedAt: now() };
        data.prescriptions.push(prescription);
      }
      const item = { ...input, id: this.uid('rxitem'), medicationName: input.medicationName.trim() };
      prescription.items.push(item);
      prescription.updatedAt = now();
      this.activity(data, 'UPDATE', 'Prescription', prescription.id, 'تمت إضافة دواء إلى الوصفة', 'Prescription item added');
      return item;
    });
  }

  async removePrescriptionItem(id: string): Promise<void> {
    await this.mutate((data) => {
      const prescription = data.prescriptions.find((item) => item.items.some((entry) => entry.id === id));
      if (!prescription) throw new Error('Prescription item not found.');
      prescription.items = prescription.items.filter((item) => item.id !== id);
      prescription.updatedAt = now();
      this.activity(data, 'DELETE', 'PrescriptionItem', id, 'تم حذف دواء من الوصفة', 'Prescription item deleted');
    });
  }

  async setMedicationActive(id: string, active: boolean): Promise<Medication> {
    return this.mutate((data) => {
      const medication = data.medications.find((item) => item.id === id);
      if (!medication) throw new Error('Medication not found.');
      medication.active = active;
      this.activity(data, 'UPDATE', 'Medication', id, 'تم تحديث حالة الدواء', 'Medication status updated');
      return medication;
    });
  }

  async addCondition(input: Omit<Condition, 'id' | 'createdAt'>) { return this.addRelated('conditions', { ...input, id: this.uid('condition'), createdAt: now() }); }
  async addAllergy(input: Omit<Allergy, 'id' | 'createdAt'>) { return this.addRelated('allergies', { ...input, id: this.uid('allergy'), createdAt: now() }); }
  async addMedication(input: Omit<Medication, 'id' | 'createdAt'>) { return this.addRelated('medications', { ...input, id: this.uid('medication'), createdAt: now() }); }
  private async addRelated<K extends 'conditions' | 'allergies' | 'medications'>(key: K, item: DatabaseSnapshot[K][number]): Promise<DatabaseSnapshot[K][number]> {
    return this.mutate((data) => {
      if (!data.patients.some((patient) => patient.id === item.patientId)) throw new Error('Patient not found.');
      (data[key] as Array<typeof item>).unshift(item); this.activity(data, 'CREATE', key, item.id, 'تمت إضافة سجل صحي', 'Health record added'); return item;
    });
  }
  async removeRelated(key: 'conditions' | 'allergies' | 'medications' | 'observations', id: string): Promise<void> {
    await this.mutate((data) => {
      const list = data[key] as Array<{ id: string }>; const index = list.findIndex((item) => item.id === id); if (index < 0) throw new Error('Record not found.');
      list.splice(index, 1); this.activity(data, 'DELETE', key, id, 'تم حذف السجل', 'Record deleted');
    });
  }

  async createSubmission(input: Omit<Submission, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Submission> {
    return this.mutate((data) => {
      const stamp = now(); const item: Submission = { ...input, id: this.uid('submission'), status: 'NEW', createdAt: stamp, updatedAt: stamp };
      data.submissions.unshift(item); this.activity(data, 'CREATE', 'Submission', item.id, 'وصل طلب جديد من الموقع', 'New website submission received'); return item;
    });
  }
  async updateSubmission(id: string, status: SubmissionStatus, internalNote?: string): Promise<Submission> {
    return this.mutate((data) => {
      const item = data.submissions.find((submission) => submission.id === id); if (!item) throw new Error('Submission not found.');
      item.status = status; item.internalNote = internalNote?.trim() || undefined; item.updatedAt = now(); this.activity(data, 'STATUS_CHANGE', 'Submission', id, 'تم تحديث طلب الموقع', 'Website submission updated'); return item;
    });
  }

  async exportJson(): Promise<string> { return JSON.stringify(await this.store.read(), null, 2); }
  async importJson(value: string): Promise<DatabaseSnapshot> {
    let input: unknown; try { input = JSON.parse(value); } catch { throw new Error('The selected file is not valid JSON.'); }
    const data = validateSnapshot(input); await this.store.write(data); return data;
  }
  async reset(): Promise<DatabaseSnapshot> { return this.store.reset(); }
}
