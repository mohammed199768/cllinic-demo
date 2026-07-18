import { describe, expect, it } from "vitest";
import { dateToLocalDateKey, formatLocalDateKey, parseLocalDateKey } from "./health-format";

describe("local date keys", () => {
  it("formats local date keys without UTC day shifts", () => {
    const parsed = parseLocalDateKey("2026-07-18");
    expect(parsed).toBeInstanceOf(Date);
    expect(dateToLocalDateKey(parsed!)).toBe("2026-07-18");
    expect(formatLocalDateKey("2026-07-18")).toBe("18/07/2026");
  });

  it("rejects malformed or impossible local date keys", () => {
    expect(parseLocalDateKey("2026-02-31")).toBeNull();
    expect(parseLocalDateKey("07/18/2026")).toBeNull();
    expect(formatLocalDateKey("")).toBe("—");
  });
});
