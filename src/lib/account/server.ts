import { createHash, randomBytes, randomInt } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { hashPassword } from "better-auth/crypto";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { isPhoneAuthEmail, isValidEmail, phoneAuthEmail, toE164 } from "@/lib/phone";
import { uid } from "@/lib/resume/defaults";

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export const accountExists = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().optional() }))
  .handler(async ({ data }) => {
    const email = data.email?.trim().toLowerCase();
    if (!email) return { exists: false };
    const sql = await getSql();
    const rows = await sql.query('select 1 from "user" where email = $1 limit 1', [email]);
    return { exists: rows.length > 0 };
  });

export const checkPhoneAvailable = createServerFn({ method: "POST" })
  .validator(z.object({ countryCode: z.string(), national: z.string() }))
  .handler(async ({ data }) => {
    const e164 = toE164(data.countryCode, data.national);
    if (!e164) throw new Error("Indica um número de telefone válido.");
    const sql = await getSql();
    const rows = await sql<{ n: number }>`select count(*)::int as n from profiles where phone = ${e164}`;
    if ((rows[0]?.n ?? 0) > 0) throw new Error("Já existe uma conta com este número de telefone.");
    return { phone: e164, email: phoneAuthEmail(e164) };
  });

export const syncMyProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      displayName: z.string().max(120).optional(),
      email: z.string().max(160).optional(),
      phone: z.string().max(20).optional(),
      countryCode: z.string().max(8).optional(),
      loginMethod: z.enum(["email", "phone"]).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql<{ user_id: string; phone: string | null }>`
      select user_id, phone from profiles where user_id = ${context.userId} limit 1
    `;
    const email = data.email && !isPhoneAuthEmail(data.email) && isValidEmail(data.email) ? data.email.trim() : null;
    const phone = data.phone ?? null;
    if (phone) {
      const taken = await sql<{ user_id: string }>`
        select user_id from profiles where phone = ${phone} and user_id <> ${context.userId} limit 1
      `;
      if (taken[0]) throw new Error("Já existe uma conta com este número de telefone.");
    }
    if (!existing[0]) {
      await sql`
        insert into profiles (user_id, display_name, email, phone, country_code, login_method, last_login_at, last_seen_at)
        values (
          ${context.userId},
          ${data.displayName ?? null},
          ${email},
          ${phone},
          ${data.countryCode ?? "+258"},
          ${data.loginMethod ?? (phone ? "phone" : "email")},
          now(),
          now()
        )
      `;
    } else {
      await sql`
        update profiles
        set display_name = coalesce(${data.displayName ?? null}, display_name),
            email = coalesce(${email}, email),
            phone = coalesce(${phone}, phone),
            country_code = coalesce(${data.countryCode ?? null}, country_code),
            login_method = coalesce(${data.loginMethod ?? null}, login_method),
            last_login_at = now(),
            last_seen_at = now(),
            updated_at = now()
        where user_id = ${context.userId}
      `;
    }
    return { ok: true as const };
  });

export const recordLogin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`
      update profiles
      set last_login_at = now(), last_seen_at = now(), updated_at = now()
      where user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const requestPasswordReset = createServerFn({ method: "POST" })
  .validator(
    z.object({
      channel: z.enum(["email", "phone"]),
      email: z.string().optional(),
      countryCode: z.string().optional(),
      national: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    if (data.channel === "email") {
      const email = data.email?.trim().toLowerCase() ?? "";
      if (!isValidEmail(email)) throw new Error("Indica um email válido.");
      const rows = await sql<{ user_id: string }>`
        select user_id from profiles where lower(email) = ${email} limit 1
      `;
      const authUser = rows[0]
        ? []
        : await sql<{ id: string }>`select id from "user" where lower(email) = ${email} limit 1`;
      const userId = rows[0]?.user_id ?? authUser[0]?.id;
      if (userId) {
        const token = randomBytes(24).toString("hex");
        await sql`
          insert into password_resets (id, user_id, channel, identifier, token_hash, expires_at)
          values (${uid()}, ${userId}, 'email', ${email}, ${sha256(token)}, now() + interval '2 hours')
        `;
        await sql`
          insert into email_outbox (id, to_email, subject, body, kind)
          values (
            ${uid()},
            ${email},
            ${"Recuperar palavra-passe — Carta"},
            ${`Usa este link para definires uma nova palavra-passe (válido 2 horas):\n/recuperar?token=${token}`},
            ${"password_reset"}
          )
        `;
      }
      return { ok: true as const, channel: "email" as const };
    }

    const e164 = toE164(data.countryCode ?? "+258", data.national ?? "");
    if (!e164) throw new Error("Indica um número de telefone válido.");
    const rows = await sql<{ user_id: string }>`select user_id from profiles where phone = ${e164} limit 1`;
    if (rows[0]) {
      const code = String(randomInt(100000, 1000000));
      await sql`
        insert into otp_codes (id, phone, purpose, code_hash, expires_at, provider_status)
        values (${uid()}, ${e164}, 'reset', ${sha256(code)}, now() + interval '10 minutes', 'queued')
      `;
    }
    return { ok: true as const, channel: "phone" as const };
  });

export const resetPasswordWithToken = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string().min(16), password: z.string().min(8).max(120) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const hash = sha256(data.token);
    const rows = await sql<{ id: string; user_id: string }>`
      select id, user_id from password_resets
      where token_hash = ${hash} and used_at is null and expires_at > now()
      limit 1
    `;
    if (!rows[0]) throw new Error("Este link já não é válido. Pede uma nova recuperação.");
    const hashed = await hashPassword(data.password);
    await sql`
      update "account"
      set password = ${hashed}, "updatedAt" = now()
      where "userId" = ${rows[0].user_id} and "providerId" = 'credential'
    `;
    await sql`update password_resets set used_at = now() where id = ${rows[0].id}`;
    return { ok: true as const };
  });
