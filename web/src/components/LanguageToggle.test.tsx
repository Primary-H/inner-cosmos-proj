import { cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageToggle } from "./LanguageToggle";
import { LocaleProvider, useLocale, useMessages } from "../i18n/LocaleProvider";

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* ignore */
  }
  document.documentElement.removeAttribute("lang");
});

afterEach(cleanup);

// A tiny consumer so we can prove the whole tree re-renders in the new language when the
// toggle is used -- i.e. the switch is real state, not just a per-button visual flip.
function LocaleProbe() {
  const t = useMessages();
  return <p data-testid="probe">{t.auth.login}</p>;
}

function renderToggle(initialLocale: "zh-CN" | "en-SG" = "zh-CN") {
  return render(
    <LocaleProvider initialLocale={initialLocale}>
      <LanguageToggle />
      <LocaleProbe />
    </LocaleProvider>
  );
}

describe("LanguageToggle", () => {
  it("marks the active locale and offers both languages", () => {
    renderToggle("zh-CN");
    expect(screen.getByRole("group", { name: "语言" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "中文" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "false");
    // The whole tree renders zh-CN copy.
    expect(screen.getByTestId("probe")).toHaveTextContent("登录");
  });

  it("switching language re-renders consumers, persists the choice and updates <html lang>", () => {
    renderToggle("zh-CN");
    fireEvent.click(screen.getByRole("button", { name: "English" }));

    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "中文" })).toHaveAttribute("aria-pressed", "false");
    // A different consumer now shows the English catalog -- proves shared state, not local.
    expect(screen.getByTestId("probe")).toHaveTextContent("Sign in");
    // Choice persisted for the next visit.
    expect(localStorage.getItem("ic-locale")).toBe("en-SG");
    // Document language reflects the switch for a11y.
    expect(document.documentElement.lang).toBe("en-SG");
  });

  it("honours a stored choice on first render without an explicit initialLocale", () => {
    localStorage.setItem("ic-locale", "en-SG");
    render(
      <LocaleProvider>
        <LanguageToggle />
      </LocaleProvider>
    );
    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "true");
  });

  it("throws a clear error if the catalog hooks are used outside a LocaleProvider", () => {
    // React logs the thrown render error; silence it so the suite output stays clean.
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => renderHook(() => useMessages())).toThrow(/LocaleProvider/);
    expect(() => renderHook(() => useLocale())).toThrow(/LocaleProvider/);
    spy.mockRestore();
  });
});
