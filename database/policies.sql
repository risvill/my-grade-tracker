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