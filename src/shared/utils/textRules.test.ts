import { describe, it, expect } from "vitest";
import { applyTextRule, type TextRule, type TextRuleOptions } from "@/shared/utils/textRules";
import type { SubtitleBlock } from "@/shared/types/subtitle";

// These tests assert the INTENDED behavior of each text rule, so a failure
// means the rule is misbehaving (not that the test mirrors the code).

const baseOptions: TextRuleOptions = {
  maxCpl: null,
  dontCutWords: false,
  maxWpl: null,
  splitSymbol: "",
  splitSymbolMode: "remove",
  splitWord: "",
  removeSymbols: "",
  transformSpaces: "none",
  textCase: "none",
  findText: "",
  replaceText: "",
};

const opts = (over: Partial<TextRuleOptions>): TextRuleOptions => ({ ...baseOptions, ...over });

const block = (over: Partial<SubtitleBlock> = {}): SubtitleBlock => ({
  id: "1",
  index: 1,
  startTime: 0,
  endTime: 10,
  text: "",
  ...over,
});

const run = (subs: SubtitleBlock[], rule: TextRule, over: Partial<TextRuleOptions>) =>
  applyTextRule(subs, rule, opts(over));

const texts = (subs: SubtitleBlock[]) => subs.map((s) => s.text);

describe("cpl (max characters per line)", () => {
  it("splits text into lines that each fit within maxCpl (whole words)", () => {
    const out = run([block({ text: "Hello world foo" })], "cpl", { maxCpl: 5, dontCutWords: true });
    expect(texts(out)).toEqual(["Hello", "world", "foo"]);
  });

  it("never emits a line longer than maxCpl when cutting words is allowed", () => {
    const out = run([block({ text: "abcdefgh" })], "cpl", { maxCpl: 3, dontCutWords: false });
    expect(out.every((s) => s.text.length <= 3)).toBe(true);
    // pieces should recombine to the original word
    expect(out.map((s) => s.text).join("")).toBe("abcdefgh");
  });

  it("distributes the original duration evenly across the new blocks", () => {
    const out = run([block({ text: "Hello world", startTime: 0, endTime: 10 })], "cpl", {
      maxCpl: 5,
      dontCutWords: true,
    });
    expect(out).toHaveLength(2);
    expect(out[0].startTime).toBeCloseTo(0);
    expect(out[0].endTime).toBeCloseTo(5);
    expect(out[1].startTime).toBeCloseTo(5);
    expect(out[1].endTime).toBeCloseTo(10);
  });

  it("reindexes the resulting blocks sequentially", () => {
    const out = run([block({ text: "Hello world foo" })], "cpl", { maxCpl: 5, dontCutWords: true });
    expect(out.map((s) => s.index)).toEqual([1, 2, 3]);
  });

  it("is a no-op when maxCpl is null", () => {
    const input = [block({ text: "Hello world" })];
    expect(run(input, "cpl", { maxCpl: null })).toBe(input);
  });
});

describe("wpl (max words per line)", () => {
  it("splits text into groups of at most maxWpl words", () => {
    const out = run([block({ text: "a b c d e" })], "wpl", { maxWpl: 2 });
    expect(texts(out)).toEqual(["a b", "c d", "e"]);
  });
});

describe("split-symbol", () => {
  it("splits on the delimiter and drops it in remove mode", () => {
    const out = run([block({ text: "one|two|three" })], "split-symbol", {
      splitSymbol: "|",
      splitSymbolMode: "remove",
    });
    expect(texts(out)).toEqual(["one", "two", "three"]);
  });

  it("keeps the delimiter attached in keep mode", () => {
    const out = run([block({ text: "one|two|three" })], "split-symbol", {
      splitSymbol: "|",
      splitSymbolMode: "keep",
    });
    expect(texts(out)).toEqual(["one|", "two|", "three"]);
  });
});

describe("split-word", () => {
  it("splits at whole-word occurrences, keeping the word with the following segment", () => {
    const out = run([block({ text: "stop here stop now" })], "split-word", { splitWord: "stop" });
    expect(texts(out)).toEqual(["stop here", "stop now"]);
  });

  it("does not split inside a larger word (whole-word match only)", () => {
    const out = run([block({ text: "stopwatch stop go" })], "split-word", { splitWord: "stop" });
    expect(texts(out)).toEqual(["stopwatch", "stop go"]);
  });
});

describe("remove-symbols", () => {
  it("removes every listed character without creating new blocks", () => {
    const out = run([block({ text: "h-e-l-l-o!" })], "remove-symbols", { removeSymbols: "-!" });
    expect(out).toHaveLength(1);
    expect(out[0].text).toBe("hello");
  });
});

describe("transform-spaces", () => {
  it("collapses runs of spaces in remove-extra mode", () => {
    const out = run([block({ text: "a  b   c" })], "transform-spaces", { transformSpaces: "remove-extra" });
    expect(out[0].text).toBe("a b c");
  });

  it("trims and collapses in normalize mode", () => {
    const out = run([block({ text: "  a  b  " })], "transform-spaces", { transformSpaces: "normalize" });
    expect(out[0].text).toBe("a b");
  });
});

describe("text-case", () => {
  it("uppercases", () => {
    expect(run([block({ text: "hello" })], "text-case", { textCase: "upper" })[0].text).toBe("HELLO");
  });

  it("lowercases", () => {
    expect(run([block({ text: "HeLLo" })], "text-case", { textCase: "lower" })[0].text).toBe("hello");
  });

  it("title-cases each word, including hyphenated parts", () => {
    expect(run([block({ text: "well-known hello world" })], "text-case", { textCase: "title" })[0].text).toBe(
      "Well-Known Hello World",
    );
  });
});

describe("find-replace", () => {
  it("replaces every occurrence of the substring", () => {
    const out = run([block({ text: "foo foofoo" })], "find-replace", { findText: "foo", replaceText: "X" });
    expect(out[0].text).toBe("X XX");
  });
});

describe("replace-words", () => {
  it("replaces only whole-word matches", () => {
    const out = run([block({ text: "cat category cat" })], "replace-words", {
      findText: "cat",
      replaceText: "dog",
    });
    expect(out[0].text).toBe("dog category dog");
  });
});

describe("general", () => {
  it("returns the same array for an empty input", () => {
    const input: SubtitleBlock[] = [];
    expect(applyTextRule(input, "cpl", opts({ maxCpl: 5 }))).toBe(input);
  });
});
