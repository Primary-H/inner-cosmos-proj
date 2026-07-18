import { useState, type FormEvent } from "react";
import { api } from "../api";
import { mobileOidc } from "../mobile-auth";
import { AsyncButton } from "../loading";
import { useMessages } from "../i18n/LocaleProvider";

// The single entry surface for /app/aurora/: it must offer both login and account
// creation, because it is the only route a new user is told to visit (see CLAUDE.md's
// own "run it locally" instructions). Historically registration only existed on the
// disconnected legacy page /pages/register.html; this component closes that gap by
// reusing the same backend contract (POST /api/v1/auth/register) inline, right next to
// login, with a small mode toggle -- no separate route, no separate theme
// implementation, so day/dusk/night rendering is automatically consistent between the
// two flows because they are now literally the same component.
export type AuthMode = "login" | "register";

export function AuthGate({ native, onSuccess }: { native: boolean; onSuccess: () => Promise<void> }) {
  const t = useMessages().auth;
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (native) return <main className="login-shell"><section className="login">
    <span className="eyebrow">{t.eyebrow}</span><h1>{t.nativeTitle}</h1>
    <p>{t.nativeCopy}</p>
    {error && <p className="error" role="alert">{error}</p>}
    <button className="send" type="button" onClick={() => void mobileOidc.beginLogin()
      .catch(reason => setError(reason instanceof Error ? reason.message : t.nativeStartFailed))}>{t.nativeContinue}</button>
  </section></main>;

  const switchMode = (next: AuthMode) => {
    if (busy) return;
    setMode(next);
    setError("");
  };

  const submitLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.login(username, password);
      await onSuccess();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t.loginFailed);
    } finally {
      setBusy(false);
    }
  };

  const submitRegister = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    // Mirrors /pages/register.html's client-side checks exactly (same rules) so the
    // in-app path feels identical to the one it is replacing as the primary entry.
    if (!username.trim() || !password) { setError(t.needUserAndPass); return; }
    if (password.length < 8) { setError(t.passwordTooShort); return; }
    if (password !== password2) { setError(t.passwordMismatch); return; }
    setBusy(true);
    try {
      await api.register(username.trim(), nickname.trim(), password);
      await onSuccess();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t.registerFailed);
    } finally {
      setBusy(false);
    }
  };

  return <main className="login-shell">
    <form className="login" onSubmit={mode === "login" ? submitLogin : submitRegister}>
      <span className="eyebrow">{t.eyebrow}</span>
      <h1>{mode === "login" ? t.loginTitle : t.registerTitle}</h1>
      <p className="auth-copy">{mode === "login" ? t.loginCopy : t.registerCopy}</p>
      <div className="auth-mode-switch" role="tablist" aria-label={t.modeSwitchLabel}>
        <button type="button" role="tab" aria-selected={mode === "login"} onClick={() => switchMode("login")}>{t.loginTab}</button>
        <button type="button" role="tab" aria-selected={mode === "register"} onClick={() => switchMode("register")}>{t.registerTab}</button>
      </div>
      <label>{t.username}<input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" /></label>
      {mode === "register" && <label>{t.nickname}
        <input value={nickname} onChange={e => setNickname(e.target.value)} autoComplete="nickname" /></label>}
      <label>{t.password}<input type="password" value={password} onChange={e => setPassword(e.target.value)}
        autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
      {mode === "register" && <label>{t.confirmPassword}
        <input type="password" value={password2} onChange={e => setPassword2(e.target.value)} autoComplete="new-password" /></label>}
      {error && <p className="error" role="alert">{error}</p>}
      <AsyncButton className="send" type="submit" busy={busy}
        busyText={mode === "login" ? t.loggingIn : t.creating}>{mode === "login" ? t.login : t.createAccount}</AsyncButton>
    </form>
  </main>;
}
