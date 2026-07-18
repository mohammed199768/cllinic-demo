// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ClinicRepository } from '../repository';
import { demoSeed, MemorySnapshotStore } from '../storage';
import { createId } from './create-id';

const originalCrypto = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function installCrypto(value: Partial<Crypto> | undefined) {
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    writable: true,
    value,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  if (originalCrypto) Object.defineProperty(globalThis, 'crypto', originalCrypto);
  else Reflect.deleteProperty(globalThis, 'crypto');
});

describe('createId', () => {
  it('uses the native globalThis.crypto.randomUUID path when available', () => {
    const native = vi.fn(() => '123e4567-e89b-42d3-a456-426614174000' as `${string}-${string}-${string}-${string}-${string}`);
    const fallback = vi.fn();
    installCrypto({ randomUUID: native, getRandomValues: fallback as Crypto['getRandomValues'] });

    expect(createId()).toBe('123e4567-e89b-42d3-a456-426614174000');
    expect(native).toHaveBeenCalledOnce();
    expect(fallback).not.toHaveBeenCalled();
  });

  it('uses getRandomValues when randomUUID is unavailable and returns UUID v4 bits', () => {
    const getRandomValues = vi.fn((bytes: Uint8Array) => {
      bytes.forEach((_, index) => { bytes[index] = index; });
      return bytes;
    });
    installCrypto({ getRandomValues: getRandomValues as Crypto['getRandomValues'] });

    const value = createId();
    expect(value).toBe('00010203-0405-4607-8809-0a0b0c0d0e0f');
    expect(value).toMatch(UUID_V4);
    expect(value[14]).toBe('4');
    expect(value[19]).toMatch(/[89ab]/i);
  });

  it('generates unique UUID v4 values across repeated fallback calls', () => {
    let sequence = 0;
    installCrypto({
      getRandomValues: ((bytes: Uint8Array) => {
        sequence += 1;
        bytes.fill(sequence);
        return bytes;
      }) as Crypto['getRandomValues'],
    });

    const values = Array.from({ length: 32 }, () => createId());
    expect(new Set(values)).toHaveLength(values.length);
    values.forEach((value) => expect(value).toMatch(UUID_V4));
  });

  it('throws a controlled error when secure browser randomness is unavailable', () => {
    installCrypto(undefined);
    expect(() => createId()).toThrow('Secure random ID generation is unavailable in this browser.');
  });

  it('does not access crypto merely by loading the utility module', async () => {
    installCrypto(undefined);
    vi.resetModules();
    const module = await import('./create-id');
    expect(module.createId).toBeTypeOf('function');
  });

  it('routes repository entity and audit IDs through the centralized factory', async () => {
    let call = 0;
    const factory = vi.fn(() => `00000000-0000-4000-8000-${String(++call).padStart(12, '0')}`);
    const repo = new ClinicRepository(new MemorySnapshotStore(), factory);
    const booking = await repo.createBooking({
      fullName: 'Factory Patient',
      phone: '0770000000',
      requestedService: 'General medicine',
      requestedDate: '2026-08-20',
      requestedTime: '10:30',
      source: 'PUBLIC_WEBSITE',
    });
    const snapshot = await repo.snapshot();

    expect(booking.id).toBe('booking-00000000-0000-4000-8000-000000000001');
    expect(snapshot.activities[0]?.id).toBe('activity-00000000-0000-4000-8000-000000000002');
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('preserves existing IDs during validated JSON import', async () => {
    const imported = structuredClone(demoSeed);
    imported.activities[0]!.id = 'existing-imported-activity-id';
    const repo = new ClinicRepository(new MemorySnapshotStore());

    await repo.importJson(JSON.stringify(imported));
    expect((await repo.snapshot()).activities[0]?.id).toBe('existing-imported-activity-id');
  });
});
