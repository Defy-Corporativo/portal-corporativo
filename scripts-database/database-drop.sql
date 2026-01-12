-- =============================================
-- Portal Corporativo Defy - Database Drop Script
-- =============================================
-- ATENÇÃO: Este script irá APAGAR todos os dados!
-- Use apenas quando quiser reiniciar o banco do zero.
-- =============================================

-- Remover triggers primeiro
DROP TRIGGER IF EXISTS update_prtc_profiles_updated_at ON prtc_profiles;
DROP TRIGGER IF EXISTS update_prtc_portals_updated_at ON prtc_portals;

-- Remover função de trigger
DROP FUNCTION IF EXISTS prtc_update_updated_at_column();

-- Remover políticas de RLS das tabelas
DROP POLICY IF EXISTS "Users can view own profile" ON prtc_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON prtc_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON prtc_profiles;
DROP POLICY IF EXISTS "Authenticated users can view active portals" ON prtc_portals;
DROP POLICY IF EXISTS "Authenticated users can view all portals" ON prtc_portals;
DROP POLICY IF EXISTS "Authenticated users can insert portals" ON prtc_portals;
DROP POLICY IF EXISTS "Authenticated users can update portals" ON prtc_portals;
DROP POLICY IF EXISTS "Authenticated users can delete portals" ON prtc_portals;

-- Remover índices
DROP INDEX IF EXISTS idx_prtc_portals_order_index;
DROP INDEX IF EXISTS idx_prtc_portals_is_active;
DROP INDEX IF EXISTS idx_prtc_portals_category;

-- Remover tabelas (ordem importa por causa das foreign keys)
DROP TABLE IF EXISTS prtc_portals CASCADE;
DROP TABLE IF EXISTS prtc_profiles CASCADE;

-- =============================================
-- Limpar tabelas antigas (sem prefixo) se existirem
-- =============================================
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_portals_updated_at ON portals;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view active portals" ON portals;
DROP POLICY IF EXISTS "Authenticated users can view all portals" ON portals;
DROP POLICY IF EXISTS "Authenticated users can insert portals" ON portals;
DROP POLICY IF EXISTS "Authenticated users can update portals" ON portals;
DROP POLICY IF EXISTS "Authenticated users can delete portals" ON portals;
DROP INDEX IF EXISTS idx_portals_order_index;
DROP INDEX IF EXISTS idx_portals_is_active;
DROP TABLE IF EXISTS portals CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =============================================
-- Após executar este script, execute o 
-- database-create.sql para recriar o schema
-- =============================================
