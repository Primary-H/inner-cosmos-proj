import { describe, expect, it } from "vitest";
import { CATALOG, DEFAULT_LOCALE, LOCALES, messagesFor } from "./messages";

// Structural "shape" of a catalog: nested keys with a leaf tag of "string" or "fn". Two
// locales are complete iff their shapes are deeply equal -- i.e. every key exists in both
// with the same value kind. The TypeScript `Messages` interface already enforces this at
// compile time; this test is the runtime backstop and the thing that fails loudly if a
// future locale is added via a cast or a merge that skips a key.
type Shape = { [k: string]: Shape | "string" | "fn" };

function shapeOf(value: unknown): Shape | "string" | "fn" {
  if (typeof value === "function") return "fn";
  if (typeof value === "string") return "string";
  if (value && typeof value === "object") {
    const out: Shape = {};
    for (const [k, v] of Object.entries(value)) out[k] = shapeOf(v);
    return out;
  }
  throw new Error(`unexpected catalog value kind: ${typeof value}`);
}

describe("message catalog", () => {
  it("exposes exactly the declared locales", () => {
    expect([...LOCALES]).toEqual(["zh-CN", "en-SG"]);
    expect(Object.keys(CATALOG).sort()).toEqual([...LOCALES].sort());
  });

  it("every locale has an identical key shape (no missing or extra keys)", () => {
    const reference = shapeOf(CATALOG[DEFAULT_LOCALE]);
    for (const locale of LOCALES) {
      expect(shapeOf(CATALOG[locale]), `locale ${locale} shape`).toEqual(reference);
    }
  });

  it("has no empty string leaves in any locale", () => {
    const emptyPaths: string[] = [];
    const walk = (value: unknown, path: string) => {
      if (typeof value === "string") {
        if (value.trim() === "") emptyPaths.push(path);
      } else if (value && typeof value === "object") {
        for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k);
      }
    };
    for (const locale of LOCALES) walk(CATALOG[locale], locale);
    expect(emptyPaths).toEqual([]);
  });

  it("interpolates counts inside the catalog, per locale", () => {
    expect(CATALOG["zh-CN"].me.proactiveValue(3)).toBe("3 个有效约定");
    expect(CATALOG["en-SG"].me.proactiveValue(3)).toBe("3 active arrangements");
    // English pluralises inside the catalog rather than concatenating at the call site.
    expect(CATALOG["en-SG"].me.proactiveValue(1)).toBe("1 active arrangement");
    expect(CATALOG["en-SG"].me.understandingValue(1)).toBe("1 confirmed understanding");
    expect(CATALOG["en-SG"].me.resonanceValue(1, 2)).toBe("1 public capsule · 2 mutual connections");
  });

  it("messagesFor returns the requested locale and falls back to the default for an unknown one", () => {
    expect(messagesFor("en-SG")).toBe(CATALOG["en-SG"]);
    // A defensive fallback for a value that slipped past the type system.
    expect(messagesFor("de-DE" as never)).toBe(CATALOG[DEFAULT_LOCALE]);
  });
});
