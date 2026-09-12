-- Per-user account fields, unique phone, password-reset + OTP architecture.
alter table profiles add column if not exists country_code text not null default '+258';
alter table profiles add column if not exists login_method text not null default 'email';
alter table profiles add column if not exists last_login_at timestamptz;
alter table profiles add column if not exists updated_at timestamptz not null default now();

create unique index if not exists profiles_email_unique
  on profiles (lower(email))
  where email is not null and email <> '';

create unique index if not exists profiles_phone_unique
  on profiles (phone)
  where phone is not null and phone <> '';

create table if not exists password_resets (
  id text primary key,
  user_id text not null,
  channel text not null,
  identifier text not null,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists password_resets_user_idx on password_resets (user_id);

-- Queued SMS one-time codes. A future SMS provider sends rows with provider_status = 'queued'.
create table if not exists otp_codes (
  id text primary key,
  phone text not null,
  purpose text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  consumed_at timestamptz,
  provider_status text not null default 'queued',
  created_at timestamptz not null default now()
);
create index if not exists otp_codes_phone_idx on otp_codes (phone, purpose);

create table if not exists email_outbox (
  id text primary key,
  to_email text not null,
  subject text not null,
  body text not null,
  kind text not null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
