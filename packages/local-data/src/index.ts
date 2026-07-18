'use client';

export * from './types';
export * from './storage';
export * from './repository';
export * from './validation';
export * from './utils/create-id';

import { ClinicRepository } from './repository';
import { IndexedDbSnapshotStore } from './storage';

export const clinicRepository = new ClinicRepository(new IndexedDbSnapshotStore());
