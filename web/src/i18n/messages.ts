// Typed message catalog (docs/tracks/TRACK-B-COMPLETE-EXPERIENCE.md §8 "B4 — global
// i18n, Singapore experience and accessibility": "Move every user-visible string out of
// components into a typed message catalog; no mixed hard-coded Chinese remains on
// supported routes. Complete Chinese and English/en-SG.").
//
// This is the FIRST B4 slice. It establishes the catalog + Locale infrastructure and
// migrates the product's entry surface -- the AuthGate (the first screen every new user
// sees) and the ProductShell navigation + Me/control space -- into it, in both zh-CN and
// English/en-SG. Later B4 slices migrate the remaining spaces onto the same `Messages`
// contract; because the contract is a TypeScript interface, a route that forgets a key,
// or a locale that omits one, is a compile error, not a silent runtime fallback.
//
// The catalog is intentionally NOT auto-derived from one locale via `typeof`: an explicit
// `Messages` interface with `string`/function value types forces every locale to supply
// every key with the right shape, which is exactly the "typed" guarantee the spec asks
// for. Dynamic phrases (counts, interpolations) are typed functions so pluralisation and
// word order stay inside the catalog per locale rather than being string-concatenated at
// the call site.

import type { ProductSpace } from "../components/ProductShell";

export const LOCALES = ["zh-CN", "en-SG"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "zh-CN";

export interface Messages {
  language: {
    /** aria-label / group label for the language switcher. */
    label: string;
    /** Short native names shown on the switcher buttons. */
    zh: string;
    en: string;
  };
  shell: {
    brand: string;
    navLabel: string;
    spaces: Record<ProductSpace, { label: string; description: string }>;
  };
  me: {
    ariaLabel: string;
    eyebrow: string;
    title: string;
    intro: string;
    identityTitle: string;
    identityNative: string;
    identityWeb: string;
    online: string;
    offline: string;
    proactiveTitle: string;
    proactiveValue: (count: number) => string;
    proactiveAction: string;
    understandingTitle: string;
    understandingValue: (count: number) => string;
    understandingAction: string;
    resonanceTitle: string;
    resonanceValue: (capsules: number, friends: number) => string;
    resonanceAction: string;
    managePush: string;
    manageMic: string;
    logout: string;
  };
  auth: {
    eyebrow: string;
    modeSwitchLabel: string;
    loginTab: string;
    registerTab: string;
    loginTitle: string;
    registerTitle: string;
    loginCopy: string;
    registerCopy: string;
    username: string;
    nickname: string;
    password: string;
    confirmPassword: string;
    login: string;
    createAccount: string;
    loggingIn: string;
    creating: string;
    // Client-side validation + failure copy (mirrors the legacy register.html checks).
    needUserAndPass: string;
    passwordTooShort: string;
    passwordMismatch: string;
    loginFailed: string;
    registerFailed: string;
    // Native (Capacitor OIDC) entry.
    nativeTitle: string;
    nativeCopy: string;
    nativeContinue: string;
    nativeStartFailed: string;
  };
}

const zhCN: Messages = {
  language: {
    label: "语言",
    zh: "中文",
    en: "English",
  },
  shell: {
    brand: "Inner Cosmos",
    navLabel: "Inner Cosmos 五个空间",
    spaces: {
      aurora: { label: "今天", description: "Aurora" },
      cosmos: { label: "内宇宙", description: "记忆与自我理解" },
      resonance: { label: "共鸣", description: "共鸣体与相遇" },
      letters: { label: "连接", description: "慢信与关系" },
      me: { label: "我的", description: "控制与边界" },
    },
  },
  me: {
    ariaLabel: "我的控制与边界",
    eyebrow: "ME · 控制与边界",
    title: "由你决定，Aurora 怎样参与。",
    intro:
      "身份、设备权限、主动回来和数据边界都集中在这里。关闭一项能力不会删除你的创新体验，也不会暗中改写已有记忆。",
    identityTitle: "登录与设备",
    identityNative: "OIDC + PKCE · 安全存储",
    identityWeb: "安全 Web Session",
    online: "当前在线",
    offline: "当前离线，时间线会在恢复后续接",
    proactiveTitle: "主动回来",
    proactiveValue: (count) => `${count} 个有效约定`,
    proactiveAction: "查看和调整",
    understandingTitle: "理解与记忆",
    understandingValue: (count) => `${count} 条已确认理解`,
    understandingAction: "纠正、追溯或撤回",
    resonanceTitle: "共鸣与连接",
    resonanceValue: (capsules, friends) =>
      `${capsules} 个公开共鸣体 · ${friends} 个双向连接`,
    resonanceAction: "管理授权",
    managePush: "管理通知权限",
    manageMic: "管理麦克风权限",
    logout: "安全退出这台设备",
  },
  auth: {
    eyebrow: "INNER COSMOS",
    modeSwitchLabel: "登录或注册",
    loginTab: "登录",
    registerTab: "注册",
    loginTitle: "回到你的内宇宙",
    registerTitle: "开始你的内宇宙",
    loginCopy: "登录后继续和 Aurora 的对话，你的记忆与共鸣都还在。",
    registerCopy: "创建一个账号，几步之内就能开始和 Aurora 说话。",
    username: "用户名",
    nickname: "昵称（可选，默认使用用户名）",
    password: "密码",
    confirmPassword: "确认密码",
    login: "登录",
    createAccount: "创建账号",
    loggingIn: "正在登录",
    creating: "正在创建",
    needUserAndPass: "请填写用户名和密码。",
    passwordTooShort: "密码至少 8 位。",
    passwordMismatch: "两次输入的密码不一致。",
    loginFailed: "登录失败",
    registerFailed: "注册失败，请换个用户名试试。",
    nativeTitle: "回到你的内宇宙",
    nativeCopy: "原生应用使用系统浏览器与 Authorization Code + PKCE 登录。密码不会进入 Aurora 应用。",
    nativeContinue: "使用身份提供方继续",
    nativeStartFailed: "无法启动安全登录",
  },
};

// English / en-SG. Singapore English keeps standard British-leaning spelling
// ("personalise", "colour") where it would appear; the entry surface below has none, so
// this payload is plain, warm, product English aimed at an English-first Singapore launch.
const enSG: Messages = {
  language: {
    label: "Language",
    zh: "中文",
    en: "English",
  },
  shell: {
    brand: "Inner Cosmos",
    navLabel: "Inner Cosmos — five spaces",
    spaces: {
      aurora: { label: "Today", description: "Aurora" },
      cosmos: { label: "Inner Cosmos", description: "Memory & self-understanding" },
      resonance: { label: "Resonance", description: "Echo capsules & encounters" },
      letters: { label: "Connect", description: "Slow letters & relationships" },
      me: { label: "You", description: "Control & boundaries" },
    },
  },
  me: {
    ariaLabel: "Your control and boundaries",
    eyebrow: "ME · CONTROL & BOUNDARIES",
    title: "You decide how Aurora takes part.",
    intro:
      "Identity, device permissions, proactive returns and data boundaries all live here. Turning a capability off never deletes your experience, and never quietly rewrites what Aurora already remembers.",
    identityTitle: "Sign-in & device",
    identityNative: "OIDC + PKCE · secure storage",
    identityWeb: "Secure web session",
    online: "Online now",
    offline: "Offline for now — your timeline picks up where it left off once you reconnect",
    proactiveTitle: "Proactive returns",
    proactiveValue: (count) =>
      count === 1 ? "1 active arrangement" : `${count} active arrangements`,
    proactiveAction: "Review & adjust",
    understandingTitle: "Understanding & memory",
    understandingValue: (count) =>
      count === 1 ? "1 confirmed understanding" : `${count} confirmed understandings`,
    understandingAction: "Correct, trace or withdraw",
    resonanceTitle: "Resonance & connections",
    resonanceValue: (capsules, friends) => {
      const c = capsules === 1 ? "1 public capsule" : `${capsules} public capsules`;
      const f = friends === 1 ? "1 mutual connection" : `${friends} mutual connections`;
      return `${c} · ${f}`;
    },
    resonanceAction: "Manage authorisations",
    managePush: "Manage notification permission",
    manageMic: "Manage microphone permission",
    logout: "Sign out of this device",
  },
  auth: {
    eyebrow: "INNER COSMOS",
    modeSwitchLabel: "Sign in or create an account",
    loginTab: "Sign in",
    registerTab: "Create account",
    loginTitle: "Back to your inner cosmos",
    registerTitle: "Begin your inner cosmos",
    loginCopy: "Sign in to continue your conversation with Aurora — your memories and resonance are all still here.",
    registerCopy: "Create an account and you can start talking with Aurora in just a few steps.",
    username: "Username",
    nickname: "Nickname (optional — defaults to your username)",
    password: "Password",
    confirmPassword: "Confirm password",
    login: "Sign in",
    createAccount: "Create account",
    loggingIn: "Signing in",
    creating: "Creating",
    needUserAndPass: "Please enter a username and password.",
    passwordTooShort: "Password must be at least 8 characters.",
    passwordMismatch: "The two passwords do not match.",
    loginFailed: "Sign-in failed",
    registerFailed: "Sign-up failed — please try a different username.",
    nativeTitle: "Back to your inner cosmos",
    nativeCopy: "The native app signs in through the system browser with Authorization Code + PKCE. Your password never enters the Aurora app.",
    nativeContinue: "Continue with your identity provider",
    nativeStartFailed: "Could not start secure sign-in",
  },
};

export const CATALOG: Record<Locale, Messages> = {
  "zh-CN": zhCN,
  "en-SG": enSG,
};

export function messagesFor(locale: Locale): Messages {
  return CATALOG[locale] ?? CATALOG[DEFAULT_LOCALE];
}
