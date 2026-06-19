-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

create table public.grades (
  id uuid not null default gen_random_uuid (),
  title text not null,
  rk1 numeric null,
  rk2 numeric null,
  exam numeric null,
  total_percent numeric null,
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  fa_grades jsonb null,
  is_pinned boolean null,
  user_id uuid null default auth.uid (),
  rk1_note text null,
  rk2_note text null,
  fa_note text null,
  quarter_note text null,
  course integer not null default 1,
  semester integer not null default 1,
  constraint grades_pkey primary key (id),
  constraint grades_user_id_fkey foreign KEY (user_id) references auth.users (id),
  constraint check_exam_range check (
    (
      (exam >= (0)::numeric)
      and (exam <= (100)::numeric)
    )
  ),
  constraint check_rk1_range check (
    (
      (rk1 >= (0)::numeric)
      and (rk1 <= (100)::numeric)
    )
  ),
  constraint check_rk2_range check (
    (
      (rk2 >= (0)::numeric)
      and (rk2 <= (100)::numeric)
    )
  )
) TABLESPACE pg_default;

create table public.profiles (
  id uuid not null,
  current_course integer null default 1,
  current_semester integer null default 1,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;