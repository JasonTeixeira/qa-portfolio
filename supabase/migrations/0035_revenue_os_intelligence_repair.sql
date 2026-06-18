-- Phase 35 — Revenue OS intelligence repair
-- Older/partial table creation can leave existing tables without columns that
-- 0034 declared inside CREATE TABLE IF NOT EXISTS. Add them forward-only.

alter table public.revenue_adaptive_sequences
  add column if not exists metadata jsonb not null default '{}'::jsonb;
