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

-- Create 'casamento_fotos' table for collaborative gallery
CREATE TABLE IF NOT EXISTS casamento_fotos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for casamento_fotos
ALTER TABLE casamento_fotos ENABLE ROW LEVEL SECURITY;

-- Allow ANYONE to insert, view (anônimos poderão ver/subir as fotos do site)
CREATE POLICY "Allow anon insert" ON casamento_fotos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select" ON casamento_fotos FOR SELECT USING (true);

-- Create bucket 'galeria_casamento' if we were running a plpgsql block, 
-- mas geralmente fazemos isso no painel do Supabase. 
-- Abaixo um pseudo-codigo pra criação/políticas via SQL:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('galeria_casamento', 'galeria_casamento', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage.objects under the bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'galeria_casamento');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'galeria_casamento');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'galeria_casamento');

-- ADDING NOME E MENSAGEM PARA O MURAL DE RECADOS DA GALERIA
ALTER TABLE casamento_fotos 
ADD COLUMN IF NOT EXISTS nome text,
ADD COLUMN IF NOT EXISTS mensagem text;

-- ENABLE REALTIME FOR casamento_fotos
ALTER PUBLICATION supabase_realtime ADD TABLE casamento_fotos;

-- CREATE GIFTS TABLES
CREATE TABLE IF NOT EXISTS presentes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor NUMERIC NOT NULL,
  imagem_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS presentes_recebidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  presente_id UUID REFERENCES presentes(id) ON DELETE SET NULL,
  nome_doador TEXT NOT NULL,
  mensagem TEXT,
  valor_pago NUMERIC NOT NULL,
  status TEXT DEFAULT 'pendente',
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INITIAL TEST DATA
INSERT INTO presentes (titulo, valor) VALUES ('Ajude o noivo a matar a hpilory', 2.00);
INSERT INTO presentes (titulo, valor) VALUES ('Ajude os noivos a irem pra lua de mel', 3.00);

-- Enable RLS and Add Policies
ALTER TABLE presentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentes_recebidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gifts_allow_public_select_presentes" ON presentes FOR SELECT USING (true);
CREATE POLICY "gifts_enable_all_auth_presentes" ON presentes FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "gifts_allow_public_insert_recebidos" ON presentes_recebidos FOR INSERT WITH CHECK (true);
CREATE POLICY "gifts_allow_public_select_recebidos" ON presentes_recebidos FOR SELECT USING (true); 
CREATE POLICY "gifts_enable_all_auth_recebidos" ON presentes_recebidos FOR ALL USING (auth.role() = 'authenticated');
