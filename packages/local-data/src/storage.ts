import seedJson from './seed.v1.json';
import type { DatabaseSnapshot } from './types';
import { validateSnapshot } from './validation';

const DB_NAME = 'ourclinic-browser-demo';
const DB_VERSION = 2;
const STORE = 'snapshots';
const KEY = 'current';

export const demoSeed = validateSnapshot(seedJson);

export interface SnapshotStore {
  read(): Promise<DatabaseSnapshot>;
  write(snapshot: DatabaseSnapshot): Promise<void>;
  reset(): Promise<DatabaseSnapshot>;
}

function clone<T>(value: T): T { return structuredClone(value); }

export class MemorySnapshotStore implements SnapshotStore {
  private snapshot: DatabaseSnapshot;
  constructor(initial: DatabaseSnapshot = demoSeed) { this.snapshot = clone(initial); }
  async read() { return clone(this.snapshot); }
  async write(snapshot: DatabaseSnapshot) { this.snapshot = clone(validateSnapshot(snapshot)); }
  async reset() { this.snapshot = clone(demoSeed); return this.read(); }
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction was aborted.'));
  });
}

function migrate(input: unknown): DatabaseSnapshot {
  if (!input || typeof input !== 'object') return clone(demoSeed);
  const current = input as Partial<DatabaseSnapshot>;
  const migrated = {
    ...clone(demoSeed),
    ...current,
    schemaVersion: 2,
    counters: { ...demoSeed.counters, ...(current.counters ?? {}) },
    prescriptions: current.prescriptions ?? [],
    submissions: current.submissions ?? [],
    activities: current.activities ?? [],
  };
  return validateSnapshot(migrated);
}

export class IndexedDbSnapshotStore implements SnapshotStore {
  private databasePromise?: Promise<IDBDatabase>;

  private open(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || !window.indexedDB) return Promise.reject(new Error('Persistent browser storage is unavailable.'));
    if (!this.databasePromise) {
      this.databasePromise = new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('Unable to open local database.'));
        request.onblocked = () => reject(new Error('Database upgrade is blocked by another open tab.'));
      });
    }
    return this.databasePromise;
  }

  async read(): Promise<DatabaseSnapshot> {
    const db = await this.open();
    const transaction = db.transaction(STORE, 'readonly');
    const existing = await requestResult(transaction.objectStore(STORE).get(KEY));
    await transactionDone(transaction);
    if (!existing) {
      await this.write(demoSeed);
      return clone(demoSeed);
    }
    const migrated = migrate(existing);
    if ((existing as DatabaseSnapshot).schemaVersion !== migrated.schemaVersion) await this.write(migrated);
    return clone(migrated);
  }

  async write(snapshot: DatabaseSnapshot): Promise<void> {
    const db = await this.open();
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(validateSnapshot(snapshot), KEY);
    await transactionDone(transaction);
    window.dispatchEvent(new CustomEvent('ourclinic:data-changed'));
  }

  async reset(): Promise<DatabaseSnapshot> {
    await this.write(clone(demoSeed));
    return this.read();
  }
}

