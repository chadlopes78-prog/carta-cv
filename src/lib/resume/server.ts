import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { FREE_CV_LIMIT, FREE_TEMPLATE_IDS } from "@/lib/config";
import { defaultSettings, emptyPayload, uid } from "./defaults";
import { TEMPLATES } from "./templates";
import type { ResumePayload, ResumeRecord, ResumeSettings } from "./types";
import { isPhoneAuthEmail } from "@/lib/phone";

type ProfileRow = {
  user_id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  country: string;
  plan: string;
  role: string;
  created_at: string;
  last_seen_at: string;
};

type ResumeRow = {
  id: string;
  user_id: string;
  name: string;
  template_id: string;
  payload: ResumePayload | string;
  settings: ResumeSettings | string;
  downloads: number;
  created_at: string;
  updated_at: string;
};

function parseJson<T>(value: T | string, fallback: T): T {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value ?? fallback;
}

function mapResume(row: ResumeRow): ResumeRecord {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    templateId: row.template_id,
    payload: parseJson(row.payload, emptyPayload()),
    settings: parseJson(row.settings, defaultSettings()),
    downloads: Number(row.downloads ?? 0),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

async function ensureProfile(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  hint?: { name?: string | null; email?: string | null },
): Promise<ProfileRow> {
  const existing = await sql<ProfileRow>`select * from profiles where user_id = ${userId} limit 1`;
  if (existing[0]) {
    await sql`update profiles set last_seen_at = now() where user_id = ${userId}`;
    return existing[0];
  }
  const admins = await sql<{ n: number }>`select count(*)::int as n from profiles where role = 'admin'`;
  const role = (admins[0]?.n ?? 0) === 0 ? "admin" : "user";
  const email = hint?.email && !isPhoneAuthEmail(hint.email) ? hint.email : null;
  await sql`
    insert into profiles (user_id, display_name, email, role)
    values (${userId}, ${hint?.name ?? null}, ${email}, ${role})
  `;
  const created = await sql<ProfileRow>`select * from profiles where user_id = ${userId} limit 1`;
  return created[0]!;
}

async function replaceChildren(
  sql: Awaited<ReturnType<typeof getSql>>,
  resumeId: string,
  userId: string,
  payload: ResumePayload,
) {
  await sql`delete from resume_experiences where resume_id = ${resumeId} and user_id = ${userId}`;
  await sql`delete from resume_education where resume_id = ${resumeId} and user_id = ${userId}`;
  await sql`delete from resume_skills where resume_id = ${resumeId} and user_id = ${userId}`;
  await sql`delete from resume_languages where resume_id = ${resumeId} and user_id = ${userId}`;
  await sql`delete from resume_certifications where resume_id = ${resumeId} and user_id = ${userId}`;
  await sql`delete from resume_courses where resume_id = ${resumeId} and user_id = ${userId}`;
  await sql`delete from resume_projects where resume_id = ${resumeId} and user_id = ${userId}`;
  await sql`delete from resume_references where resume_id = ${resumeId} and user_id = ${userId}`;

  for (const [i, item] of payload.experience.entries()) {
    await sql`
      insert into resume_experiences (id, resume_id, user_id, sort_order, title, company, location, start_date, end_date, current, description)
      values (${item.id || uid()}, ${resumeId}, ${userId}, ${i}, ${item.title}, ${item.company}, ${item.location}, ${item.startDate}, ${item.endDate}, ${item.current}, ${item.description})
    `;
  }
  for (const [i, item] of payload.education.entries()) {
    await sql`
      insert into resume_education (id, resume_id, user_id, sort_order, course, institution, location, start_date, end_date, description)
      values (${item.id || uid()}, ${resumeId}, ${userId}, ${i}, ${item.course}, ${item.institution}, ${item.location}, ${item.startDate}, ${item.endDate}, ${item.description})
    `;
  }
  for (const [i, item] of payload.skills.entries()) {
    await sql`
      insert into resume_skills (id, resume_id, user_id, sort_order, name)
      values (${item.id || uid()}, ${resumeId}, ${userId}, ${i}, ${item.name})
    `;
  }
  for (const [i, item] of payload.languages.entries()) {
    await sql`
      insert into resume_languages (id, resume_id, user_id, sort_order, name, level)
      values (${item.id || uid()}, ${resumeId}, ${userId}, ${i}, ${item.name}, ${item.level})
    `;
  }
  for (const [i, item] of payload.certifications.entries()) {
    await sql`
      insert into resume_certifications (id, resume_id, user_id, sort_order, name, institution, year)
      values (${item.id || uid()}, ${resumeId}, ${userId}, ${i}, ${item.name}, ${item.institution}, ${item.year})
    `;
  }
  for (const [i, item] of payload.courses.entries()) {
    await sql`
      insert into resume_courses (id, resume_id, user_id, sort_order, name, institution, year)
      values (${item.id || uid()}, ${resumeId}, ${userId}, ${i}, ${item.name}, ${item.institution}, ${item.year})
    `;
  }
  for (const [i, item] of payload.projects.entries()) {
    await sql`
      insert into resume_projects (id, resume_id, user_id, sort_order, name, description, url)
      values (${item.id || uid()}, ${resumeId}, ${userId}, ${i}, ${item.name}, ${item.description}, ${item.url})
    `;
  }
  for (const [i, item] of payload.references.entries()) {
    await sql`
      insert into resume_references (id, resume_id, user_id, sort_order, name, title, company, phone, email)
      values (${item.id || uid()}, ${resumeId}, ${userId}, ${i}, ${item.name}, ${item.title}, ${item.company}, ${item.phone}, ${item.email})
    `;
  }
}

export const getMe = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profile = await ensureProfile(sql, context.userId);
    const counts = await sql<{ n: number }>`select count(*)::int as n from resumes where user_id = ${context.userId}`;
    return {
      userId: context.userId,
      displayName: profile.display_name,
      email: profile.email,
      phone: profile.phone,
      plan: profile.plan as "free" | "premium",
      role: profile.role as "user" | "admin",
      resumeCount: counts[0]?.n ?? 0,
      freeLimit: FREE_CV_LIMIT,
    };
  });

export const updateAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      displayName: z.string().max(120).optional(),
      phone: z.string().max(40).optional(),
      country: z.string().max(80).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    await sql`
      update profiles
      set display_name = coalesce(${data.displayName ?? null}, display_name),
          phone = coalesce(${data.phone ?? null}, phone),
          country = coalesce(${data.country ?? null}, country)
      where user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const activatePremium = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    await sql`update profiles set plan = 'premium' where user_id = ${context.userId}`;
    return { ok: true as const, plan: "premium" as const };
  });

export const listResumes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const rows = await sql<ResumeRow>`
      select id, user_id, name, template_id, payload, settings, downloads, created_at, updated_at
      from resumes where user_id = ${context.userId}
      order by updated_at desc
    `;
    return rows.map(mapResume);
  });

export const getResume = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<ResumeRow>`
      select id, user_id, name, template_id, payload, settings, downloads, created_at, updated_at
      from resumes where id = ${data.id} and user_id = ${context.userId} limit 1
    `;
    if (!rows[0]) throw new Error("Este CV não existe ou não pertence à tua conta.");
    return mapResume(rows[0]);
  });

export const createResume = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      name: z.string().min(1).max(120).optional(),
      templateId: z.string().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const profile = await ensureProfile(sql, context.userId);
    const countRows = await sql<{ n: number }>`select count(*)::int as n from resumes where user_id = ${context.userId}`;
    const count = countRows[0]?.n ?? 0;
    if (profile.plan !== "premium" && count >= FREE_CV_LIMIT) {
      throw new Error(`O plano gratuito permite até ${FREE_CV_LIMIT} CVs. Passa a Premium para criar mais.`);
    }
    const templateId = data.templateId && TEMPLATES.some((t) => t.id === data.templateId) ? data.templateId : "moderno";
    const meta = TEMPLATES.find((t) => t.id === templateId);
    if (meta?.premium && profile.plan !== "premium" && !(FREE_TEMPLATE_IDS as readonly string[]).includes(templateId)) {
      throw new Error("Este modelo é Premium.");
    }
    const id = uid();
    const name = data.name?.trim() || "CV sem título";
    const payload = emptyPayload();
    const settings = defaultSettings();
    await sql.query(
      `insert into resumes (id, user_id, name, template_id, payload, settings)
       values ($1, $2, $3, $4, $5, $6)`,
      [id, context.userId, name, templateId, JSON.stringify(payload), JSON.stringify(settings)],
    );
    return { id };
  });

const saveSchema = z.object({
  id: z.string(),
  name: z.string().max(120).optional(),
  templateId: z.string().optional(),
  payload: z.any().optional(),
  settings: z.any().optional(),
});

export const saveResume = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(saveSchema)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql<ResumeRow>`
      select id, user_id, name, template_id, payload, settings, downloads, created_at, updated_at
      from resumes where id = ${data.id} and user_id = ${context.userId} limit 1
    `;
    if (!existing[0]) throw new Error("Não foi possível guardar as alterações. Tenta novamente.");
    const nextPayload = (data.payload as ResumePayload) ?? parseJson(existing[0].payload, emptyPayload());
    const nextSettings = (data.settings as ResumeSettings) ?? parseJson(existing[0].settings, defaultSettings());
    const nextName = data.name?.trim() || existing[0].name;
    const nextTemplate = data.templateId || existing[0].template_id;
    await sql.query(
      `update resumes
       set name = $1, template_id = $2, payload = $3, settings = $4, updated_at = now()
       where id = $5 and user_id = $6`,
      [nextName, nextTemplate, JSON.stringify(nextPayload), JSON.stringify(nextSettings), data.id, context.userId],
    );
    try {
      await replaceChildren(sql, data.id, context.userId, nextPayload);
    } catch {
      /* child tables are a mirror — payload is source of truth */
    }
    return { ok: true as const, updatedAt: new Date().toISOString() };
  });

export const duplicateResume = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const profile = await ensureProfile(sql, context.userId);
    const countRows = await sql<{ n: number }>`select count(*)::int as n from resumes where user_id = ${context.userId}`;
    if (profile.plan !== "premium" && (countRows[0]?.n ?? 0) >= FREE_CV_LIMIT) {
      throw new Error(`O plano gratuito permite até ${FREE_CV_LIMIT} CVs.`);
    }
    const rows = await sql<ResumeRow>`
      select * from resumes where id = ${data.id} and user_id = ${context.userId} limit 1
    `;
    if (!rows[0]) throw new Error("Este CV não existe ou não pertence à tua conta.");
    const id = uid();
    const name = `${rows[0].name} — cópia`;
    const payloadJson = typeof rows[0].payload === "string" ? rows[0].payload : JSON.stringify(rows[0].payload);
    const settingsJson = typeof rows[0].settings === "string" ? rows[0].settings : JSON.stringify(rows[0].settings);
    await sql.query(
      `insert into resumes (id, user_id, name, template_id, payload, settings)
       values ($1, $2, $3, $4, $5, $6)`,
      [id, context.userId, name, rows[0].template_id, payloadJson, settingsJson],
    );
    return { id };
  });

export const deleteResume = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from resumes where id = ${data.id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const recordDownload = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`update resumes set downloads = downloads + 1 where id = ${data.id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    if (me.role !== "admin") throw new Error("Acesso reservado à administração.");

    const users = await sql<{ n: number }>`select count(*)::int as n from profiles`;
    const todayUsers = await sql<{ n: number }>`select count(*)::int as n from profiles where created_at::date = current_date`;
    const cvs = await sql<{ n: number }>`select count(*)::int as n from resumes`;
    const todayCvs = await sql<{ n: number }>`select count(*)::int as n from resumes where created_at::date = current_date`;
    const downloads = await sql<{ n: number }>`select coalesce(sum(downloads),0)::int as n from resumes`;
    const templates = await sql<{ template_id: string; n: number }>`
      select template_id, count(*)::int as n from resumes group by template_id order by n desc
    `;
    const people = await sql<{
      user_id: string;
      display_name: string | null;
      email: string | null;
      created_at: string;
      last_seen_at: string;
      plan: string;
      cv_count: number;
    }>`
      select p.user_id, p.display_name, p.email, p.created_at, p.last_seen_at, p.plan,
        (select count(*)::int from resumes r where r.user_id = p.user_id) as cv_count
      from profiles p
      order by p.created_at desc
      limit 200
    `;
    return {
      totalUsers: users[0]?.n ?? 0,
      newUsers: todayUsers[0]?.n ?? 0,
      totalCvs: cvs[0]?.n ?? 0,
      cvsToday: todayCvs[0]?.n ?? 0,
      downloads: downloads[0]?.n ?? 0,
      templates,
      people,
    };
  });
