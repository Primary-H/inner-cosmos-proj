import { AppearanceToggle } from "./AppearanceToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useMessages } from "../i18n/LocaleProvider";

export type ProductSpace = "aurora" | "cosmos" | "resonance" | "letters" | "me";

// Ordered list of the five spaces. Display labels/descriptions now live in the typed
// message catalog (web/src/i18n/messages.ts -> shell.spaces), not here, so the nav can be
// rendered in either language; this array is only the stable key order + membership check.
export const PRODUCT_SPACES: ProductSpace[] = ["aurora", "cosmos", "resonance", "letters", "me"];

export function initialProductSpace(search = window.location.search): ProductSpace {
  const value = new URLSearchParams(search).get("space");
  return PRODUCT_SPACES.includes(value as ProductSpace) ? value as ProductSpace : "aurora";
}

// Real, stable, shareable route per space (see docs/tracks/TRACK-B-COMPLETE-EXPERIENCE.md
// section 5's suggested route model). "letters" keeps its target's Chinese-facing product
// name ("连接") but its path follows the spec's `/connections/letters` slot.
const spacePaths: Record<ProductSpace, string> = {
  aurora: "/aurora",
  cosmos: "/cosmos",
  resonance: "/resonance",
  letters: "/connections/letters",
  me: "/me"
};

export function spacePath(space: ProductSpace): string {
  return spacePaths[space];
}

// Resolves the active space from a router pathname. Matches nested sub-routes too
// (e.g. "/cosmos/starfield") so a future per-space route split (B1's next slice) does not
// need to touch this resolver -- only add real <Route> elements underneath.
export function productSpaceFromPath(pathname: string): ProductSpace {
  const match = PRODUCT_SPACES.find((space) => {
    const base = spacePaths[space];
    return pathname === base || pathname.startsWith(`${base}/`);
  });
  return match ?? "aurora";
}

export function ProductShellNavigation({ active, onNavigate }: { active: ProductSpace; onNavigate: (space: ProductSpace) => void }) {
  const t = useMessages();
  return <nav className="app-shell-nav" aria-label={t.shell.navLabel}>
    <div className="app-mark"><span aria-hidden="true">✦</span><strong>{t.shell.brand}</strong></div>
    <div className="space-tabs">{PRODUCT_SPACES.map((value) => {
      const { label, description } = t.shell.spaces[value];
      return <button type="button" key={value} className={active === value ? "active" : ""}
        aria-current={active === value ? "page" : undefined} onClick={() => onNavigate(value)}>
        <strong>{label}</strong><small>{description}</small>
      </button>;
    })}</div>
  </nav>;
}

export function MeSpace({ native, connected, wakeIntentCount, activeClaimCount, publicCapsuleCount,
  friendCount, onNavigate, onRequestPush, onRequestMicrophone, onLogout }: {
  native: boolean; connected: boolean; wakeIntentCount: number; activeClaimCount: number;
  publicCapsuleCount: number; friendCount: number; onNavigate: (space: ProductSpace) => void;
  onRequestPush: () => void; onRequestMicrophone: () => void; onLogout: () => void;
}) {
  const t = useMessages();
  const m = t.me;
  return <section className="controls-space" aria-label={m.ariaLabel}>
    <span className="eyebrow">{m.eyebrow}</span><h1>{m.title}</h1>
    <p>{m.intro}</p>
    <div className="control-grid">
      <article><strong>{m.identityTitle}</strong><span>{native ? m.identityNative : m.identityWeb}</span><small>{connected ? m.online : m.offline}</small></article>
      <article><strong>{m.proactiveTitle}</strong><span>{m.proactiveValue(wakeIntentCount)}</span><button type="button" onClick={() => onNavigate("aurora")}>{m.proactiveAction}</button></article>
      <article><strong>{m.understandingTitle}</strong><span>{m.understandingValue(activeClaimCount)}</span><button type="button" onClick={() => onNavigate("cosmos")}>{m.understandingAction}</button></article>
      <article><strong>{m.resonanceTitle}</strong><span>{m.resonanceValue(publicCapsuleCount, friendCount)}</span><button type="button" onClick={() => onNavigate("resonance")}>{m.resonanceAction}</button></article>
    </div>
    <LanguageToggle />
    <AppearanceToggle />
    {native && <div className="mobile-actions"><button type="button" onClick={onRequestPush}>{m.managePush}</button><button type="button" onClick={onRequestMicrophone}>{m.manageMic}</button></div>}
    <button type="button" className="danger-quiet" onClick={onLogout}>{m.l