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
