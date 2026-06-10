-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.grades (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  rk1 numeric CHECK (rk1 >= 0::numeric AND rk1 <= 100::numeric),
  rk2 numeric CHECK (rk2 >= 0::numeric AND rk2 <= 100::numeric),
  exam numeric CHECK (exam >= 0::numeric AND exam <= 100::numeric),
  total_percent numeric,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  fa_grades jsonb,
  is_pinned boolean,
  user_id uuid DEFAULT auth.uid(),
  CONSTRAINT grades_pkey PRIMARY KEY (id),
  CONSTRAINT grades_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);