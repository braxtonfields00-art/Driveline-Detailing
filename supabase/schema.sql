-- Run this in your Supabase project's SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text,
  vehicle text not null,
  service text not null,
  location text not null,
  condition text,
  notes text,
  status text not null default 'new' check (status in ('new','contacted','quoted','booked','closed')),
  source text
);

alter table public.quote_requests enable row level security;

-- Public visitors must not be able to read or modify quote records directly.
-- Inserts are performed only by the submit-quote Edge Function using the service role key.
revoke all on public.quote_requests from anon, authenticated;

-- Optional dashboard access: create a separate authenticated staff policy only if you
-- want staff to view rows through Supabase Auth. For the first version, view leads in
-- Supabase Dashboard > Table Editor > quote_requests.
