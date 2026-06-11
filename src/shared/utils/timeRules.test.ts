import { describe, it, expect } from "vitest";
import { applyTimeRule, type TimeRule, type TimeRuleOptions } from "@/shared/utils/timeRules";
import type { SubtitleBlock } from "@/shared/types/subtitle";

// These tests assert the INTENDED behavior of each time rule. Times are stored
// in seconds on the blocks; assertions use toBeCloseTo to avoid float noise.

const baseOptions: TimeRuleOptions = {
  maxCps: null,
  maxCpsWindowMs: null,
  maxCpsDontCutWords: false,
  minCps: null,
  minCpsWindowMs: null,
  minCpsDontCutWords: false,
  maxWps: null,
  maxWpsWindowMs: null,
  minWps: null,
  minWpsWindowMs: null,
  minGapMs: null,
  maxGapMs: null,
  mergeGapMs: null,
  shiftMs: null,
  shiftDirection: "forward",
  trimMs: null,
};

const opts = (over: Partial<TimeRuleOptions>): TimeRuleOptions => ({ ...baseOptions, ...over });

let nextId = 0;
const block = (over: Partial<SubtitleBlock> = {}): SubtitleBlock => ({
  id: `b${nextId++}`,
  index: 1,
  startTime: 0,
  endTime: 1,
  text: "",
  ...over,
});

const run = (subs: SubtitleBlock[], rule: TimeRule, over: Partial<TimeRuleOptions>) =>
  applyTimeRule(subs, rule, opts(over));

const cps = (s: SubtitleBlock) => s.text.length / (s.endTime - s.startTime);
const wps = (s: SubtitleBlock) => s.text.trim().split(/\s+/).filter(Boolean).length / (s.endTime - s.startTime);

describe("shift", () => {
  it("moves all cues forward by the given amount", () => {
    const out = run([block({ startTime: 2, endTime: 4 })], "shift", { shiftMs: 1000, shiftDirection: "forward" });
    expect(out[0].startTime).toBeCloseTo(3);
    expect(out[0].endTime).toBeCloseTo(5);
  });

  it("moves all cues backward when there is room", () => {
    const out = run([block({ startTime: 2, endTime: 3 })], "shift", { shiftMs: 1000, shiftDirection: "backward" });
    expect(out[0].startTime).toBeCloseTo(1);
    expect(out[0].endTime).toBeCloseTo(2);
  });

  it("clamps a backward shift so no cue starts before zero", () => {
    const out = run([block({ startTime: 0.5, endTime: 1.5 })], "shift", {
      shiftMs: 1000,
      shiftDirection: "backward",
    });
    expect(out[0].startTime).toBeCloseTo(0);
    expect(out[0].endTime).toBeCloseTo(1); // duration preserved
  });
});

describe("fix-overlaps", () => {
  it("pushes an overlapping cue to start when the previous one ends, preserving its duration", () => {
    const out = run(
      [block({ startTime: 0, endTime: 5 }), block({ startTime: 3, endTime: 6 })],
      "fix-overlaps",
      {},
    );
    expect(out[0].endTime).toBeCloseTo(5); // first unchanged
    expect(out[1].startTime).toBeCloseTo(5);
    expect(out[1].endTime).toBeCloseTo(8); // original 3s duration kept
  });

  it("resolves a cascade of overlaps", () => {
    const out = run(
      [
        block({ startTime: 0, endTime: 5 }),
        block({ startTime: 3, endTime: 6 }),
        block({ startTime: 7, endTime: 7.5 }),
      ],
      "fix-overlaps",
      {},
    );
    expect(out[1].startTime).toBeCloseTo(5);
    expect(out[1].endTime).toBeCloseTo(8);
    expect(out[2].startTime).toBeCloseTo(8);
    expect(out[2].endTime).toBeCloseTo(8.5);
  });
});

describe("min-gap", () => {
  it("pushes the next cue so the gap is at least minGap, keeping its duration", () => {
    const out = run(
      [block({ startTime: 0, endTime: 1 }), block({ startTime: 1, endTime: 2 })],
      "min-gap",
      { minGapMs: 500 },
    );
    expect(out[1].startTime).toBeCloseTo(1.5);
    expect(out[1].endTime).toBeCloseTo(2.5);
  });
});

describe("max-gap", () => {
  it("pulls the next cue closer so the gap is at most maxGap", () => {
    const out = run(
      [block({ startTime: 0, endTime: 1 }), block({ startTime: 3, endTime: 4 })],
      "max-gap",
      { maxGapMs: 500 },
    );
    expect(out[1].startTime).toBeCloseTo(1.5);
    expect(out[1].endTime).toBeCloseTo(2.5);
  });
});

describe("merge-gap", () => {
  it("merges adjacent cues whose gap is smaller than mergeGap", () => {
    const out = run(
      [
        block({ startTime: 0, endTime: 1, text: "Hello" }),
        block({ startTime: 1.2, endTime: 2, text: "world" }),
      ],
      "merge-gap",
      { mergeGapMs: 500 },
    );
    expect(out).toHaveLength(1);
    expect(out[0].text).toBe("Hello world");
    expect(out[0].startTime).toBeCloseTo(0);
    expect(out[0].endTime).toBeCloseTo(2);
  });

  it("leaves cues separated by a large gap untouched", () => {
    const input = [block({ startTime: 0, endTime: 1 }), block({ startTime: 2, endTime: 3 })];
    const out = run(input, "merge-gap", { mergeGapMs: 500 });
    expect(out).toHaveLength(2);
  });
});

describe("trim-duration", () => {
  it("shrinks each cue symmetrically by the trim amount", () => {
    const out = run([block({ startTime: 0, endTime: 2 })], "trim-duration", { trimMs: 1000 });
    expect(out[0].startTime).toBeCloseTo(0.5);
    expect(out[0].endTime).toBeCloseTo(1.5);
  });
});

describe("max-cps (max characters per second)", () => {
  it("ensures no resulting cue exceeds the max characters-per-second", () => {
    const out = run(
      [block({ startTime: 0, endTime: 1, text: "01234567890123456789" })], // 20 chars in 1s
      "max-cps",
      { maxCps: 10, maxCpsWindowMs: 1000 },
    );
    // every block should now be at or under 10 cps (small epsilon for rounding)
    expect(out.every((s) => cps(s) <= 10 + 0.01)).toBe(true);
    // no characters lost
    expect(out.map((s) => s.text).join("")).toBe("01234567890123456789");
  });
});

describe("min-cps (min characters per second)", () => {
  it("merges cues that are too slow into one that meets the minimum, or exhausts the list", () => {
    const out = run(
      [
        block({ startTime: 0, endTime: 5, text: "Hi" }),
        block({ startTime: 5, endTime: 10, text: "there" }),
      ],
      "min-cps",
      { minCps: 1, minCpsWindowMs: 1000 },
    );
    expect(out).toHaveLength(1);
    expect(out[0].text).toBe("Hi there");
    expect(out[0].startTime).toBeCloseTo(0);
    expect(out[0].endTime).toBeCloseTo(10);
  });
});

describe("max-wps (max words per second)", () => {
  it("ensures no resulting cue exceeds the max words-per-second", () => {
    const out = run(
      [block({ startTime: 0, endTime: 1, text: "one two three four five six" })], // 6 words in 1s
      "max-wps",
      { maxWps: 3, maxWpsWindowMs: 1000 },
    );
    expect(out.every((s) => wps(s) <= 3 + 0.01)).toBe(true);
  });
});

describe("min-wps (min words per second)", () => {
  it("merges cues that are too slow", () => {
    const out = run(
      [
        block({ startTime: 0, endTime: 5, text: "Hi" }),
        block({ startTime: 5, endTime: 10, text: "there" }),
      ],
      "min-wps",
      { minWps: 1, minWpsWindowMs: 1000 },
    );
    expect(out).toHaveLength(1);
    expect(out[0].text).toBe("Hi there");
  });
});

describe("general", () => {
  it("returns the same array for an empty input", () => {
    const input: SubtitleBlock[] = [];
    expect(applyTimeRule(input, "shift", opts({ shiftMs: 1000 }))).toBe(input);
  });
});
