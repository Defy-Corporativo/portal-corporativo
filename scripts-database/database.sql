-- =============================================
-- Portal Corporativo Defy - Database Schema
-- =============================================
-- SCRIPT PARA RECRIAR O BANCO DE DADOS
-- Este script contém tanto DROP quanto CREATE statements
-- Pode ser executado para recriar todo o schema do zero
-- 
-- ATENÇÃO: Executar este script irá APAGAR todos os dados!
-- =============================================

-- =============================================
-- PARTE 1: DROP - Remover objetos existentes
-- =============================================
-- Usando bloco DO com exception handling para evitar erros se objetos não existirem

DO $$ 
BEGIN
    -- Remover triggers
    DROP TRIGGER IF EXISTS update_prtc_profiles_updated_at ON prtc_profiles;
    DROP TRIGGER IF EXISTS update_prtc_portals_updated_at ON prtc_portals;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Remover função de trigger (seguro mesmo se não existir)
DROP FUNCTION IF EXISTS prtc_update_updated_at_column() CASCADE;

-- Remover políticas de RLS (usando bloco para tratar tabelas inexistentes)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own profile" ON prtc_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON prtc_profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON prtc_profiles;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Authenticated users can view active portals" ON prtc_portals;
    DROP POLICY IF EXISTS "Authenticated users can view all portals" ON prtc_portals;
    DROP POLICY IF EXISTS "Authenticated users can insert portals" ON prtc_portals;
    DROP POLICY IF EXISTS "Authenticated users can update portals" ON prtc_portals;
    DROP POLICY IF EXISTS "Authenticated users can delete portals" ON prtc_portals;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Remover políticas de storage (storage.objects sempre existe)
DROP POLICY IF EXISTS "Public read access for portal icons" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload portal icons" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete portal icons" ON storage.objects;

-- Remover índices (usando bloco para tratar caso não existam)
DO $$ 
BEGIN
    DROP INDEX IF EXISTS idx_prtc_portals_order_index;
    DROP INDEX IF EXISTS idx_prtc_portals_is_active;
    DROP INDEX IF EXISTS idx_prtc_portals_category;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Remover tabelas (CASCADE remove dependências automaticamente)
DROP TABLE IF EXISTS prtc_portals CASCADE;
DROP TABLE IF EXISTS prtc_profiles CASCADE;

-- Nota: Seção de limpeza de tabelas antigas (profiles, portals sem prefixo) removida
-- pois causa erro se as tabelas não existirem. Execute manualmente se necessário.

-- =============================================
-- PARTE 2: CREATE - Criar objetos
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Table: prtc_profiles
-- =============================================
-- Stores user profile information from SSO authentication

CREATE TABLE IF NOT EXISTS prtc_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE prtc_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for prtc_profiles
CREATE POLICY "Users can view own profile" ON prtc_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON prtc_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON prtc_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- Table: prtc_portals
-- =============================================
-- Stores sub-portal information for the corporate portal

CREATE TABLE IF NOT EXISTS prtc_portals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(150) NOT NULL,
    url TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'Globe',
    custom_icon_url TEXT,
    category VARCHAR(20) NOT NULL DEFAULT 'internal' CHECK (category IN ('internal', 'external')),
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES prtc_profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE prtc_portals ENABLE ROW LEVEL SECURITY;

-- Policies for prtc_portals
-- All authenticated users can view active portals
CREATE POLICY "Authenticated users can view active portals" ON prtc_portals
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);

-- All authenticated users can view all portals (for admin purposes)
CREATE POLICY "Authenticated users can view all portals" ON prtc_portals
    FOR SELECT USING (auth.role() = 'authenticated');

-- All authenticated users can insert portals
CREATE POLICY "Authenticated users can insert portals" ON prtc_portals
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- All authenticated users can update portals
CREATE POLICY "Authenticated users can update portals" ON prtc_portals
    FOR UPDATE USING (auth.role() = 'authenticated');

-- All authenticated users can delete portals
CREATE POLICY "Authenticated users can delete portals" ON prtc_portals
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX IF NOT EXISTS idx_prtc_portals_order_index ON prtc_portals(order_index);
CREATE INDEX IF NOT EXISTS idx_prtc_portals_is_active ON prtc_portals(is_active);
CREATE INDEX IF NOT EXISTS idx_prtc_portals_category ON prtc_portals(category);

-- =============================================
-- Triggers for updated_at
-- =============================================

CREATE OR REPLACE FUNCTION prtc_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for prtc_profiles
DROP TRIGGER IF EXISTS update_prtc_profiles_updated_at ON prtc_profiles;
CREATE TRIGGER update_prtc_profiles_updated_at
    BEFORE UPDATE ON prtc_profiles
    FOR EACH ROW
    EXECUTE FUNCTION prtc_update_updated_at_column();

-- Trigger for prtc_portals
DROP TRIGGER IF EXISTS update_prtc_portals_updated_at ON prtc_portals;
CREATE TRIGGER update_prtc_portals_updated_at
    BEFORE UPDATE ON prtc_portals
    FOR EACH ROW
    EXECUTE FUNCTION prtc_update_updated_at_column();

-- =============================================
-- Storage: Portal Icons Bucket
-- =============================================
-- Create bucket for storing custom portal icons

INSERT INTO storage.buckets (id, name, public)
VALUES ('portal-icons', 'portal-icons', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for public read access
CREATE POLICY "Public read access for portal icons"
ON storage.objects FOR SELECT
USING (bucket_id = 'portal-icons');

-- Policy for authenticated uploads
CREATE POLICY "Authenticated users can upload portal icons"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'portal-icons' 
  AND auth.role() = 'authenticated'
);

-- Policy for authenticated deletes
CREATE POLICY "Authenticated users can delete portal icons"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'portal-icons' 
  AND auth.role() = 'authenticated'
);

-- =============================================
-- Sample Data (Optional)
-- =============================================
-- Uncomment the following to insert sample portals

-- INSERT INTO prtc_portals (name, description, url, icon, category, order_index) VALUES
-- ('Forecast Comercial', 'Gestão de oportunidades e previsão de vendas', 'https://forecast-comercial.defysolutions.com.br', 'TrendingUp', 'internal', 0),
-- ('Site Institucional', 'Site oficial da Defy Solutions', 'https://defysolutions.com.br', 'Globe', 'external', 0);
