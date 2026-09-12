export const COUNTRY_CODES = [
  { code: "+258", iso: "MZ", label: "Moçambique" },
  { code: "+351", iso: "PT", label: "Portugal" },
  { code: "+244", iso: "AO", label: "Angola" },
  { code: "+55", iso: "BR", label: "Brasil" },
  { code: "+27", iso: "ZA", label: "África do Sul" },
  { code: "+263", iso: "ZW", label: "Zimbabué" },
  { code: "+264", iso: "NA", label: "Namíbia" },
  { code: "+255", iso: "TZ", label: "Tanzânia" },
  { code: "+254", iso: "KE", label: "Quénia" },
  { code: "+1", iso: "US", label: "EUA / Canadá" },
  { code: "+44", iso: "GB", label: "Reino Unido" },
  { code: "+33", iso: "FR", label: "França" },
  { code: "+34", iso: "ES", label: "Espanha" },
  { code: "+49", iso: "DE", label: "Alemanha" },
  { code: "+39", iso: "IT", label: "Itália" },
  { code: "+91", iso: "IN", label: "Índia" },
  { code: "+86", iso: "CN", label: "China" },
] as const;

export const PHONE_AUTH_DOMAIN = "phone.carta.app";

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function toE164(countryCode: string, national: string): string | null {
  const cc = digitsOnly(countryCode);
  let local = digitsOnly(national);
  if (!cc || !local) return null;
  if (local.startsWith(cc)) local = local.slice(cc.length);
  local = local.replace(/^0+/, "");
  if (local.length < 6 || local.length > 12) return null;
  return `${cc}${local}`;
}

export function phoneAuthEmail(e164: string): string {
  return `${digitsOnly(e164)}@${PHONE_AUTH_DOMAIN}`;
}

export function isPhoneAuthEmail(email: string | null | undefined): boolean {
  return Boolean(email && email.toLowerCase().endsWith(`@${PHONE_AUTH_DOMAIN}`));
}

export function publicEmail(email: string | null | undefined): string | null {
  if (!email || isPhoneAuthEmail(email)) return null;
  return email;
}

export function formatPhone(e164: string | null | undefined): string {
  if (!e164) return "";
  const d = digitsOnly(e164);
  if (d.startsWith("258") && d.length === 12) return `+258 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
  return `+${d}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim()) && value.length <= 160;
}

export function passwordError(password: string, confirm?: string): string | null {
  if (password.length < 8) return "A palavra-passe deve ter pelo menos 8 caracteres.";
  if (confirm !== undefined && password !== confirm) return "As palavras-passe não coincidem.";
  return null;
}

export function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already") || m.includes("exist") || m.includes("registered")) {
    return "Já existe uma conta com estes dados. Entra ou recupera a palavra-passe.";
  }
  if (m.includes("invalid password") || m.includes("invalid email or password") || m.includes("invalid credentials")) {
    return "Email, número ou palavra-passe incorrectos.";
  }
  if (m.includes("invalid email")) return "Indica um email válido.";
  if (m.includes("password") && m.includes("short")) return "A palavra-passe deve ter pelo menos 8 caracteres.";
  if (m.includes("unauthorized")) return "A sessão expirou. Entra novamente.";
  return message || "Não foi possível concluir. Tenta novamente.";
}
