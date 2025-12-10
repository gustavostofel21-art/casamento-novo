-- Add 'telefone' column to 'convidados' if it doesn't exist
ALTER TABLE convidados ADD COLUMN IF NOT EXISTS telefone TEXT;

-- Create 'acompanhantes' table
CREATE TABLE IF NOT EXISTS acompanhantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  convidado_id UUID REFERENCES convidados(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  parentesco TEXT NOT NULL, -- 'Esposo(a)', 'Filho(a)', etc.
  is_crianca BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (Row Level Security) if appropriate, or ensure policies exist
ALTER TABLE acompanhantes ENABLE ROW LEVEL SECURITY;

-- Allow access similar to convidados (assuming public or authenticated)
-- For now, create a policy allowing all operations for authenticated users
CREATE POLICY "Enable all for authenticated users" ON acompanhantes
    FOR ALL USING (auth.role() = 'authenticated');
