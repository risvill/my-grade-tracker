-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
ALTER TABLE {your table} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own grades" ON grades 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own grades" ON grades 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own grades" ON grades 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own grades" ON grades 
FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE {your table} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

alter table {your table} enable row level security;

create policy "Users can view their own achievements" 
on public.user_achievements for select 
using (auth.uid() = user_id);

create policy "Users can insert their own achievements" 
on public.user_achievements for insert 
with check (auth.uid() = user_id);