import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDocumentLocale,
  detectLocale,
  getStoredLocale,
  resolveInitialLocale,
  setStoredLocale,
} from "./locale";

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* ignore */
  }
});

afterEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* ignore */
  }
});

describe("detectLocale", () => {
  it("maps any Chinese variant to zh-CN", () => {
    expect(detectLocale(["zh-CN"])).toBe("zh-CN");
    expect(detectLocale(["zh-Hans"])).toBe("zh-CN");
    expect(detectLocale(["zh-TW", "en-US"])).toBe("zh-CN");
    expect(detectLocale(["ZH"])).toBe("zh-CN");
  });

  it("maps any English variant to en-SG (English-first Singapore intent)", () => {
    expect(detectLocale(["en-SG"])).toBe("en-SG");
    expect(detectLocale(["en-US"])).toBe("en-SG");
    expect(detectLocale(["en-GB", "zh-CN"])).toBe("en-SG");
  });

  it("prefers the first recognised language in order", () => {
    expect(detectLocale(["fr-FR", "en-US", "zh-CN"])).toBe("en-SG");
    expect(detectLocale(["ms-MY", "zh-CN", "en-US"])).toBe("zh-CN");
  });

  it("returns null when nothing recognisable is present", () => {
    expect(detectLocale([])).toBeNull();
    expect(detectLocale(["ms-MY", "ta-IN"])).toBeNull();
  });
});

describe("stored locale", () => {
  it("round-trips a valid locale and rejects an invalid stored value", () => {
    expect(getStoredLocale()).toBeNull();
    setStoredLocale("en-SG");
    expect(getStoredLocale()).toBe("en-SG");
    setStoredLocale(null);
    expect(getStoredLocale()).toBeNull();
    localStorage.setItem("ic-locale", "klingon");
    expect(getStoredLocale()).toBeNull();
  });
});

describe("resolveInitialLocale", () => {
  it("prefers an explicit stored choice over browser detection", () => {
    setStoredLocale("en-SG");
    expect(resolveInitialLocale()).toBe("en-SG");
    setStoredLocale("zh-CN");
    expect(resolveInitialLocale()).toBe("zh-CN");
  });
});

describe("applyDocumentLocale", () => {
  it("reflects the locale on the given element's lang attribute", () => {
    const el = document.createElement("html");
    applyDocumentLocale("en-SG", el);
    expect(el.lang).toBe("en-SG");
    applyDocumentLocale("zh-CN", el);
    expect(el.lang).toBe("zh-CN");
  });
});
