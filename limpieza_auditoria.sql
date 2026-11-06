-- ============================================================================
-- SCRIPT DE LIMPIEZA COMPLETA: AUDITORÍA, TRIGGERS Y FUNCIONES EN SUPABASE
-- Objetivo: Eliminar el error '0A000: input of anonymous composite types'
-- ============================================================================

-- 1. ELIMINACIÓN DINÁMICA DE TODOS LOS TRIGGERS ASOCIADOS A AUDITORÍA
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT event_object_table, trigger_name
        FROM information_schema.triggers
        WHERE trigger_schema = 'public'
          AND (
              trigger_name ILIKE '%audit%'
              OR trigger_name ILIKE '%log%'
              OR action_statement ILIKE '%audit%'
              OR action_statement ILIKE '%auditoria%'
              OR event_object_table IN ('clientes', 'mercaderias', 'cotizaciones', 'detalle_cotizacion', 'categorias', 'usuarios')
          )
          AND trigger_name NOT ILIKE 'pg_%'
          AND trigger_name NOT ILIKE 'supabase_%'
    ) LOOP
        BEGIN
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I CASCADE;', r.trigger_name, r.event_object_table);
            RAISE NOTICE 'Trigger eliminado con éxito: % en tabla %', r.trigger_name, r.event_object_table;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Aviso al intentar eliminar trigger % en %: %', r.trigger_name, r.event_object_table, SQLERRM;
        END;
    END LOOP;
END $$;

-- 2. ELIMINACIÓN EXPLÍCITA DE TRIGGERS POR NOMBRES CONVENCIONALES
DROP TRIGGER IF EXISTS trg_auditoria_clientes ON public.clientes CASCADE;
DROP TRIGGER IF EXISTS trg_auditoria_mercaderias ON public.mercaderias CASCADE;
DROP TRIGGER IF EXISTS trg_auditoria_cotizaciones ON public.cotizaciones CASCADE;
DROP TRIGGER IF EXISTS trg_auditoria_detalle_cotizacion ON public.detalle_cotizacion CASCADE;
DROP TRIGGER IF EXISTS trg_auditoria_categorias ON public.categorias CASCADE;
DROP TRIGGER IF EXISTS trg_auditoria_usuarios ON public.usuarios CASCADE;

DROP TRIGGER IF EXISTS audit_clientes ON public.clientes CASCADE;
DROP TRIGGER IF EXISTS audit_mercaderias ON public.mercaderias CASCADE;
DROP TRIGGER IF EXISTS audit_cotizaciones ON public.cotizaciones CASCADE;
DROP TRIGGER IF EXISTS audit_detalle_cotizacion ON public.detalle_cotizacion CASCADE;
DROP TRIGGER IF EXISTS audit_categorias ON public.categorias CASCADE;
DROP TRIGGER IF EXISTS audit_usuarios ON public.usuarios CASCADE;

DROP TRIGGER IF EXISTS trigger_auditoria_clientes ON public.clientes CASCADE;
DROP TRIGGER IF EXISTS trigger_auditoria_mercaderias ON public.mercaderias CASCADE;
DROP TRIGGER IF EXISTS trigger_auditoria_cotizaciones ON public.cotizaciones CASCADE;

-- 3. ELIMINACIÓN DINÁMICA Y EXPLÍCITA DE FUNCIONES DE DISPARADOR DE AUDITORÍA
DO $$
DECLARE
    fn RECORD;
BEGIN
    FOR fn IN (
        SELECT routine_name
        FROM information_schema.routines
        WHERE routine_schema = 'public'
          AND routine_type = 'FUNCTION'
          AND (
              routine_name ILIKE '%audit%'
              OR routine_name ILIKE '%auditoria%'
          )
    ) LOOP
        BEGIN
            EXECUTE format('DROP FUNCTION IF EXISTS public.%I() CASCADE;', fn.routine_name);
            RAISE NOTICE 'Función eliminada con éxito: %', fn.routine_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Aviso al intentar eliminar función %: %', fn.routine_name, SQLERRM;
        END;
    END LOOP;
END $$;

DROP FUNCTION IF EXISTS public.fn_auditoria_sistema() CASCADE;
DROP FUNCTION IF EXISTS public.fn_auditoria() CASCADE;
DROP FUNCTION IF EXISTS public.registrar_auditoria() CASCADE;
DROP FUNCTION IF EXISTS public.audit_trigger_function() CASCADE;
DROP FUNCTION IF EXISTS public.auditar_cambios() CASCADE;
DROP FUNCTION IF EXISTS public.auditoria_trigger() CASCADE;
DROP FUNCTION IF EXISTS public.log_cambios() CASCADE;

-- 4. ELIMINAR TABLA DE AUDITORÍA Y SUS POLÍTICAS RLS (CASCADE elimina automáticamente RLS asociadas)
DROP TABLE IF EXISTS public.auditoria_sistema CASCADE;
DROP TABLE IF EXISTS public.auditoria CASCADE;

-- 5. CONSULTAS DE CONTROL Y COMPROBACIÓN
-- Debe retornar 0 filas para tablas de auditoría:
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name ILIKE '%audit%';

-- Verifica qué triggers quedan activos en las tablas principales:
SELECT event_object_table, trigger_name, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('clientes', 'mercaderias', 'cotizaciones', 'detalle_cotizacion', 'categorias', 'usuarios');
