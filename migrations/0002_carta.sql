-- Carta CV SaaS schema
create table if not exists profiles (
  user_id text primary key,
  display_name text,
  email text,
  phone text,
  country text not null default 'MZ',
  plan text not null default 'free',
  role text not null default 'user',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists resume_templates (
  id text primary key,
  name text not null,
  category text not null,
  is_premium boolean not null default false
);

create table if not exists resumes (
  id text primary key,
  user_id text not null,
  name text not null,
  template_id text not null default 'moderno',
  payload jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  downloads integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists resumes_user_id_idx on resumes (user_id);
create index if not exists resumes_updated_at_idx on resumes (updated_at desc);

create table if not exists resume_experiences (
  id text primary key,
  resume_id text not null references resumes(id) on delete cascade,
  user_id text not null,
  sort_order integer not null default 0,
  title text,
  company text,
  location text,
  start_date text,
  end_date text,
  current boolean not null default false,
  description text
);
create index if not exists resume_experiences_resume_idx on resume_experiences (resume_id);

create table if not exists resume_education (
  id text primary key,
  resume_id text not null references resumes(id) on delete cascade,
  user_id text not null,
  sort_order integer not null default 0,
  course text,
  institution text,
  location text,
  start_date text,
  end_date text,
  description text
);
create index if not exists resume_education_resume_idx on resume_education (resume_id);

create table if not exists resume_skills (
  id text primary key,
  resume_id text not null references resumes(id) on delete cascade,
  user_id text not null,
  sort_order integer not null default 0,
  name text not null
);
create index if not exists resume_skills_resume_idx on resume_skills (resume_id);

create table if not exists resume_languages (
  id text primary key,
  resume_id text not null references resumes(id) on delete cascade,
  user_id text not null,
  sort_order integer not null default 0,
  name text not null,
  level text not null default 'intermedio'
);
create index if not exists resume_languages_resume_idx on resume_languages (resume_id);

create table if not exists resume_certifications (
  id text primary key,
  resume_id text not null references resumes(id) on delete cascade,
  user_id text not null,
  sort_order integer not null default 0,
  name text,
  institution text,
  year text
);
create index if not exists resume_certifications_resume_idx on resume_certifications (resume_id);

create table if not exists resume_courses (
  id text primary key,
  resume_id text not null references resumes(id) on delete cascade,
  user_id text not null,
  sort_order integer not null default 0,
  name text,
  institution text,
  year text
);
create index if not exists resume_courses_resume_idx on resume_courses (resume_id);

create table if not exists resume_projects (
  id text primary key,
  resume_id text not null references resumes(id) on delete cascade,
  user_id text not null,
  sort_order integer not null default 0,
  name text,
  description text,
  url text
);
create index if not exists resume_projects_resume_idx on resume_projects (resume_id);

create table if not exists resume_references (
  id text primary key,
  resume_id text not null references resumes(id) on delete cascade,
  user_id text not null,
  sort_order integer not null default 0,
  name text,
  title text,
  company text,
  phone text,
  email text
);
create index if not exists resume_references_resume_idx on resume_references (resume_id);

insert into resume_templates (id, name, category, is_premium) values
  ('moderno', 'Moderno', 'moderno', false),
  ('executivo', 'Executivo', 'executivo', true),
  ('minimalista', 'Minimalista', 'minimalista', false),
  ('criativo', 'Criativo', 'criativo', true),
  ('ats', 'ATS', 'ats', false),
  ('classico', 'Clássico', 'profissional', true),
  ('tecnico', 'Técnico', 'profissional', true),
  ('academico', 'Académico', 'simples', true)
on conflict (id) do nothing;
