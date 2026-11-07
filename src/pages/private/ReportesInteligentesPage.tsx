import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useReportesGerencia } from '../../api/hooks/useReportesGerencia';
import { useAuth } from '../../api/hooks/useAuth';
import ModuleTitle from '../../components/ModuleTitle';
import AdminBadge from '../../components/ui/AdminBadge';
import { Icons } from '../../components/Icons';
import { maskPath } from '../../routes/routeMap';
import { showToast } from '../../utils/swal';
import {
  generarAnalisisAuditoriaIA,
  recolectarDatosGlobalesDistribuidora,
  hasGeminiApiKey,
  detectarEnfoqueConsulta,
  DEFAULT_GEMINI_MODEL,
  type ReporteGerencialIA,
  type EnfoqueComercial,
} from '../../services/geminiService';
import { exportarReporteAuditoriaPdf } from '../../services/reportPdfService';
import type { ReporteInteligenteGerenciaVista } from '../../types/database';

const COLORES_GRAFICO = {
  terracota: '#C85A32',
  espresso: '#2C221E',
  caramelo: '#D97706',
  verdeBosque: '#2A9D8F',
  doradoTrigo: '#E9C46A',
  rosaCoral: '#E76F51',
  grisSuave: '#A89F91',
};

const PIE_COLORS = [
  COLORES_GRAFICO.terracota,
  COLORES_GRAFICO.verdeBosque,
  COLORES_GRAFICO.caramelo,
  COLORES_GRAFICO.doradoTrigo,
  COLORES_GRAFICO.espresso,
  COLORES_GRAFICO.rosaCoral,
];

export default function ReportesInteligentesPage() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();

  // Consulta directa a la vista de base de datos vw_reportes_inteligentes_gerencia
  const { data: logs = [], isLoading: isLogsLoading } = useReportesGerencia();

  // Referencia al contenedor de gráficos para captura en PDF
  const graficosRef = useRef<HTMLDivElement>(null);

  // Consulta por defecto
  const [consultaPrompt, setConsultaPrompt] = useState(
    '¿Cuántos clientes nuevos se han sumado y cuál es el dinamismo de la cartera?'
  );

  // Estados del reporte
  const [reporte, setReporte] = useState<ReporteGerencialIA | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [muestraUtilizada, setMuestraUtilizada] = useState<ReporteInteligenteGerenciaVista[]>([]);
  const [enfoqueActivo, setEnfoqueActivo] = useState<EnfoqueComercial>('clientes');

  const isGeminiConfigured = hasGeminiApiKey();

  // Restricción RBAC: Sistemas o Administrador
  const rawRole = (user?.rol || '').toLowerCase().trim();
  const isAuthorized =
    rawRole === 'sistemas' ||
    rawRole === 'administrador' ||
    user?.correo === 'salexanderr2@gmail.com';

  const sugerenciasEnfocadas = [
    {
      label: 'Crecimiento de Clientes',
      prompt: '¿Cuántos clientes nuevos se han sumado y cuál es el dinamismo de la cartera?',
    },
    {
      label: 'Inventario y Existencias',
      prompt: '¿Qué movimientos de existencias y rotación de inventario se registraron recientemente?',
    },
    {
      label: 'Pipeline de Cotizaciones',
      prompt: '¿Cuál es el volumen de cotizaciones emitidas y cuántas ventas se han concretado?',
    },
    {
      label: 'Catálogo y Precios',
      prompt: '¿Qué productos florales o precios se han actualizado en el catálogo comercial?',
    },
  ];

  // ==========================================
  // MUESTRA DIRECTIVA GLOBAL MULTI-MÓDULO
  // ==========================================
  const registrosEnfocados = useMemo(() => {
    return muestraUtilizada.length > 0 ? muestraUtilizada : logs;
  }, [muestraUtilizada, logs]);

  // ==========================================
  // DATOS PARA GRÁFICOS INTERACTIVOS (RECHARTS)
  // ==========================================

  // Gráfico 1: Evolución Temporal
  const datosGraficoTemporal = useMemo(() => {
    const grupos: Record<string, { fecha: string; principal: number; secundario: number }> = {};
    const ordenados = [...registrosEnfocados].reverse();

    ordenados.forEach((r) => {
      if (!r.created_at) return;
      const d = new Date(r.created_at);
      if (isNaN(d.getTime())) return;
      const claveFecha = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;

      if (!grupos[claveFecha]) {
        grupos[claveFecha] = { fecha: claveFecha, principal: 0, secundario: 0 };
      }

      const mod = String(r.modulo || '').toLowerCase();
      const desc = (r.detalle_comercial_amigable || r.descripcion || '').toLowerCase();

      if (mod.includes('cotiza') || desc.includes('cotiz') || desc.includes('venta') || desc.includes('aprob')) {
        grupos[claveFecha].principal++;
      } else {
        grupos[claveFecha].secundario++;
      }
    });

    const lista = Object.values(grupos);
    return lista.length > 0
      ? lista.slice(-10)
      : [{ fecha: 'Hoy', principal: 0, secundario: 0 }];
  }, [registrosEnfocados, enfoqueActivo]);

  // Gráfico 2: Actividad por Usuario Responsable (de la vista)
  const datosGraficoUsuarios = useMemo(() => {
    const conteo: Record<string, number> = {};

    registrosEnfocados.forEach((r) => {
      const nombreUsuario = r.usuario_responsable || 'Equipo Comercial';
      conteo[nombreUsuario] = (conteo[nombreUsuario] || 0) + 1;
    });

    return Object.entries(conteo)
      .map(([name, value]) => ({ name, value }))
      .slice(0, 5);
  }, [registrosEnfocados]);

  // Manejador principal para generar reporte
  const handleGenerarReporte = async (promptCustom?: string) => {
    const textoConsulta = (promptCustom ?? consultaPrompt).trim();

    if (!hasGeminiApiKey()) {
      showToast(
        'Falta configurar la variable VITE_GEMINI_API_KEY en el archivo .env.local del proyecto.',
        'error'
      );
      return;
    }

    if (!textoConsulta) {
      showToast('Por favor escribe tu consulta comercial en lenguaje natural.', 'warning');
      return;
    }

    if (logs.length === 0) {
      showToast('No existen operaciones registradas en el sistema para analizar.', 'warning');
      return;
    }

    const enfoquePrevio = detectarEnfoqueConsulta(textoConsulta);
    setEnfoqueActivo(enfoquePrevio);

    setIsGenerating(true);
    try {
      // 1. Recolectar en paralelo todas las vistas maestras unificadas:
      // - vw_inventario_y_estado_actual (inventario completo y existencias)
      // - vw_resumen_comercial_global (cotizaciones y clientes)
      // - vw_categorias_actuales y vw_unidades_medida_actuales
      const datosMaestros = await recolectarDatosGlobalesDistribuidora();

      // 2. Enviar eventos de auditoría junto con el estado consolidado de todas las tablas maestras a Gemini
      const resultado = await generarAnalisisAuditoriaIA(
        logs,
        {
          promptUsuario: textoConsulta,
          totalRegistrosEnBd: logs.length,
        },
        datosMaestros
      );

      setReporte(resultado);
      setEnfoqueActivo(resultado.enfoque_principal);

      // Filtrar la muestra relevante de la vista
      let muestraFiltrada = logs;
      if (resultado.enfoque_principal === 'clientes') {
        const c = logs.filter((r) => (r.modulo || '').toLowerCase() === 'clientes');
        if (c.length > 0) muestraFiltrada = c;
      } else if (resultado.enfoque_principal === 'inventario') {
        const inv = logs.filter((r) => (r.modulo || '').toLowerCase() === 'inventario');
        if (inv.length > 0) muestraFiltrada = inv;
      } else if (resultado.enfoque_principal === 'cotizaciones') {
        const cot = logs.filter((r) => (r.modulo || '').toLowerCase() === 'cotizaciones');
        if (cot.length > 0) muestraFiltrada = cot;
      } else if (resultado.enfoque_principal === 'catalogo') {
        const cat = logs.filter((r) =>
          ['mercaderias', 'categorias', 'unidades_medida'].includes((r.modulo || '').toLowerCase())
        );
        if (cat.length > 0) muestraFiltrada = cat;
      }

      setMuestraUtilizada(muestraFiltrada.slice(0, 50));
      showToast('Informe enfocado generado exitosamente por Google Gemini.', 'success');
    } catch (err: any) {
      console.error('Error generando reporte con Google Gemini:', err);
      showToast(err.message || 'Error al conectar con Google Gemini.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportarPdf = async () => {
    if (!reporte) return;

    setIsExportingPdf(true);
    try {
      let generalImg: string | null = null;
      if (graficosRef.current) {
        try {
          generalImg = await toPng(graficosRef.current, {
            backgroundColor: '#FFFFFF',
            quality: 0.95,
            pixelRatio: 2,
          });
        } catch (captureErr) {
          console.warn('No se pudo capturar imagen de los gráficos para el PDF:', captureErr);
        }
      }

      await exportarReporteAuditoriaPdf({
        reporte,
        usuarioResponsable: {
          nombre: user?.nombre ? `${user.nombre} ${user.apellido || ''}`.trim() : user?.correo || 'Gerente',
          correo: user?.correo || '',
          rol: user?.rol || 'Administrador',
        },
        graficosImagenes: {
          generalImg,
        },
      });

      showToast('Informe Gerencial descargado exitosamente en PDF.', 'success');
    } catch (err: any) {
      console.error('Error al exportar PDF:', err);
      showToast(err.message || 'Error al generar el documento PDF.', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const formatDateTime = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '-';
      return new Intl.DateTimeFormat('es-GT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const getHealthBadge = (salud: string) => {
    switch (salud?.toLowerCase()) {
      case 'excelente':
        return <AdminBadge variant="success" dot>Excelente</AdminBadge>;
      case 'favorable':
        return <AdminBadge variant="info">Favorable</AdminBadge>;
      case 'moderada':
        return <AdminBadge variant="warning">Moderada</AdminBadge>;
      case 'en riesgo':
      default:
        return <AdminBadge variant="danger" dot>En Riesgo</AdminBadge>;
    }
  };

  const getEnfoqueEtiqueta = (enfoque: EnfoqueComercial) => {
    switch (enfoque) {
      case 'clientes':
        return 'Cartera de Clientes';
      case 'inventario':
        return 'Inventario y Existencias';
      case 'cotizaciones':
        return 'Ventas y Cotizaciones';
      case 'catalogo':
        return 'Catálogo y Precios';
      default:
        return 'Balance General';
    }
  };

  // Restricción de Acceso RBAC
  if (!isAuthLoading && !isAuthorized) {
    return (
      <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-primary)' }}>
        <Icons.AlertTriangle size={48} color="#DC2626" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Acceso Denegado
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
          El módulo de <strong>Reportes Inteligentes</strong> está reservado exclusivamente
          para usuarios con rol de <strong>Sistemas</strong> o <strong>Administrador</strong>.
        </p>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => navigate(maskPath('/dashboard/inicio'))}
          style={{ padding: '9px 24px' }}
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="reportes-inteligentes-module" style={{ paddingBottom: '3rem' }}>
      <ModuleTitle title="Reportes Inteligentes de Gerencia" />

      {/* Cabecera del Módulo */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
          Reportes Inteligentes de Gerencia
        </h2>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Asesoría directiva con datos de <code>vw_reportes_inteligentes_gerencia</code> y Google Gemini ({DEFAULT_GEMINI_MODEL})
        </span>
      </div>

      {/* Alerta de Configuración */}
      {!isGeminiConfigured && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '10px',
            padding: '1.15rem 1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ color: '#DC2626', marginTop: '2px', display: 'flex' }}>
            <Icons.AlertTriangle size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#DC2626', marginBottom: '3px' }}>
              Configuración Requerida: Variable VITE_GEMINI_API_KEY no detectada
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              Para habilitar el asistente comercial directivo con Google Gemini ({DEFAULT_GEMINI_MODEL}), configura la variable{' '}
              <code style={{ background: 'rgba(220, 38, 38, 0.12)', color: '#DC2626', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                VITE_GEMINI_API_KEY=AIzaSy...
              </code>{' '}
              en el archivo <code style={{ fontWeight: 700 }}>.env.local</code> del proyecto.
            </p>
          </div>
        </div>
      )}

      {/* Cuadro de Consulta en Lenguaje Natural */}
      <div
        style={{
          background: 'var(--bg-app)',
          border: '1px solid var(--border-soft)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border-soft)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Asesor Comercial IA:
            </span>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '16px',
                background: isGeminiConfigured ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${isGeminiConfigured ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                fontSize: '11px',
                fontWeight: 700,
                color: isGeminiConfigured ? '#16a34a' : '#dc2626',
              }}
            >
              <Icons.Bot size={13} />
              <span>{isGeminiConfigured ? `Google Gemini (${DEFAULT_GEMINI_MODEL}) • Conectado` : 'Sin conexión'}</span>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Vista gerencial: <strong>{logs.length}</strong> operaciones disponibles
          </div>
        </div>

        {/* Textarea */}
        <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
          <label
            htmlFor="prompt-consulta"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '6px',
            }}
          >
            Pregunta o solicitud directiva en lenguaje natural:
          </label>
          <textarea
            id="prompt-consulta"
            value={consultaPrompt}
            onChange={(e) => setConsultaPrompt(e.target.value)}
            placeholder="Ej. ¿Cuántos clientes nuevos se han sumado este mes? / ¿Cómo está la rotación de inventario? / ¿Cuántas cotizaciones se han aprobado?"
            rows={3}
            disabled={isGenerating || !isGeminiConfigured}
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: '13.5px',
              lineHeight: 1.5,
              borderRadius: '10px',
              border: '1px solid var(--border-med)',
              background: 'var(--bg-input, #FFFFFF)',
              color: 'var(--text-primary)',
              outline: 'none',
              resize: 'vertical',
              minHeight: '80px',
              fontFamily: "'Source Sans 3', sans-serif",
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#C85A32')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-med)')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleGenerarReporte();
              }
            }}
          />
        </div>

        {/* Sugerencias Rápidas */}
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Consultas directas recomendadas:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {sugerenciasEnfocadas.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setConsultaPrompt(sug.prompt)}
                disabled={isGenerating}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: '1px solid var(--border-soft)',
                  background: consultaPrompt === sug.prompt ? 'rgba(200, 90, 50, 0.12)' : 'var(--bg-input, #FFFFFF)',
                  color: consultaPrompt === sug.prompt ? '#C85A32' : 'var(--text-secondary)',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  fontWeight: consultaPrompt === sug.prompt ? 700 : 500,
                  transition: 'all 0.15s ease',
                }}
              >
                {sug.label}
              </button>
            ))}
          </div>
        </div>

        {/* Botones de Acción */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            borderTop: '1px solid var(--border-soft)',
            paddingTop: '0.85rem',
          }}
        >
          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            Presiona <strong>Ctrl + Enter</strong> para ejecutar el análisis enfocado.
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {consultaPrompt && (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setConsultaPrompt('')}
                disabled={isGenerating}
                style={{ padding: '7px 12px', fontSize: '12px', color: 'var(--text-secondary)' }}
              >
                Limpiar
              </button>
            )}

            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={() => handleGenerarReporte()}
              disabled={isGenerating || isLogsLoading || !isGeminiConfigured || !consultaPrompt.trim()}
              style={{
                padding: '9px 22px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: !isGeminiConfigured || !consultaPrompt.trim() ? 'var(--text-muted, #A89F91)' : '#C85A32',
                color: '#FFFFFF',
                boxShadow: !isGeminiConfigured || !consultaPrompt.trim() ? 'none' : '0 2px 6px rgba(200, 90, 50, 0.25)',
                cursor: !isGeminiConfigured || !consultaPrompt.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {isGenerating ? (
                <>
                  <Icons.RefreshCw size={15} className="animate-spin" />
                  <span>Procesando Consulta...</span>
                </>
              ) : (
                <>
                  <Icons.Zap size={15} />
                  <span>Generar Informe Enfocado</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Estado Inicial */}
      {!reporte && !isGenerating && (
        <div
          style={{
            background: 'var(--bg-app)',
            border: '2px dashed var(--border-soft)',
            borderRadius: '12px',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(200, 90, 50, 0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              color: '#C85A32',
            }}
          >
            <Icons.BarChart size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Reportes Directivos en Lenguaje Natural
          </h3>
          <p style={{ maxWidth: '580px', margin: '0 auto 1.5rem', fontSize: '13.5px', lineHeight: 1.6 }}>
            Escribe una consulta sobre clientes, inventario, cotizaciones o catálogo.
            La IA responderá de forma directa basándose en <code>vw_reportes_inteligentes_gerencia</code>, adaptando gráficos, métricas y el resumen de operaciones sin datos masivos no solicitados.
          </p>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => handleGenerarReporte()}
            disabled={logs.length === 0 || !isGeminiConfigured}
            style={{
              padding: '10px 24px',
              fontSize: '13.5px',
              backgroundColor: !isGeminiConfigured ? 'var(--text-muted, #A89F91)' : '#C85A32',
            }}
          >
            Generar Diagnóstico Inicial
          </button>
        </div>
      )}

      {/* Spinner de Carga */}
      {isGenerating && (
        <div
          style={{
            background: 'var(--bg-app)',
            border: '1px solid var(--border-soft)',
            borderRadius: '12px',
            padding: '4rem 2rem',
            textAlign: 'center',
          }}
        >
          <div
            className="loader-spinner"
            style={{
              width: '48px',
              height: '48px',
              border: '3px solid rgba(200, 90, 50, 0.2)',
              borderTop: '3px solid #C85A32',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.25rem',
            }}
          />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Elaborando Dictamen Gerencial con Google Gemini...
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '460px', margin: '0 auto' }}>
            Consultando la vista gerencial y sintetizando la respuesta exacta a tu pregunta.
          </p>
        </div>
      )}

      {/* ======================================================== */}
      {/* RESULTADOS ADAPTATIVOS DEL INFORME */}
      {/* ======================================================== */}
      {reporte && !isGenerating && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* BANNER 1: RESPUESTA DIRECTA A LA CONSULTA */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(200, 90, 50, 0.3)',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              borderLeft: '5px solid #C85A32',
              boxShadow: '0 2px 10px rgba(200, 90, 50, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#C85A32',
                    letterSpacing: '0.5px',
                  }}
                >
                  Respuesta Directa a tu Consulta
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: 'rgba(200, 90, 50, 0.1)',
                    color: '#C85A32',
                  }}
                >
                  Foco: {getEnfoqueEtiqueta(reporte.enfoque_principal)}
                </span>
              </div>
              {getHealthBadge(reporte.salud_comercial)}
            </div>
            <p style={{ margin: 0, fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {reporte.respuesta_directa}
            </p>
          </div>

          {/* Encabezado del Reporte con Botón de Exportar a PDF */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-soft)',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(44, 34, 30, 0.04)',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {reporte.titulo}
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Generado: {formatDateTime(reporte.fecha_generacion)} • Motor: Google Gemini ({reporte.modelo_utilizado})
              </span>
            </div>

            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={handleExportarPdf}
              disabled={isExportingPdf}
              style={{
                padding: '10px 22px',
                fontSize: '13.5px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#C85A32',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(200, 90, 50, 0.3)',
              }}
            >
              {isExportingPdf ? (
                <>
                  <Icons.RefreshCw size={16} className="animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <Icons.Download size={16} />
                  <span>Exportar Reporte a PDF</span>
                </>
              )}
            </button>
          </div>

          {/* Tarjetas KPI Específicas */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1rem',
            }}
          >
            {reporte.metricas_especificas.map((metrica, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border-soft)',
                  borderRadius: '10px',
                  padding: '1.15rem',
                  borderLeft: `4px solid ${idx === 0 ? '#C85A32' : idx === 1 ? '#2A9D8F' : idx === 2 ? '#D97706' : '#2C221E'}`,
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  {metrica.label}
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {metrica.valor}
                </div>
                {metrica.interpretacion && (
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {metrica.interpretacion}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* ======================================================== */}
          {/* SECCIÓN DE GRÁFICOS ADAPTATIVOS AL TEMA CONSULTADO */}
          {/* ======================================================== */}
          <div
            ref={graficosRef}
            id="seccion-graficos-comerciales"
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-soft)',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(44, 34, 30, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '4px', height: '18px', background: '#C85A32', borderRadius: '2px' }} />
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Visualización Estadística: {getEnfoqueEtiqueta(reporte.enfoque_principal)}
                </h4>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {registrosEnfocados.length} operaciones evaluadas
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {/* Gráfico 1: Evolución Cronológica */}
              <div
                style={{
                  background: 'var(--bg-app)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  border: '1px solid var(--border-soft)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Evolución en el Tiempo
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {reporte.enfoque_principal === 'clientes'
                      ? 'Nuevos clientes vs Seguimiento'
                      : reporte.enfoque_principal === 'cotizaciones'
                      ? 'Ventas cerradas vs En proceso'
                      : 'Movimientos por fecha'}
                  </span>
                </div>

                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={datosGraficoTemporal} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E6DFD5" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#7C6E67' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#7C6E67' }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#2C221E',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '12px',
                        }}
                        itemStyle={{ color: '#FFFFFF' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} iconType="circle" />
                      <Bar
                        dataKey="principal"
                        name={
                          reporte.enfoque_principal === 'clientes'
                            ? 'Nuevos Clientes'
                            : reporte.enfoque_principal === 'cotizaciones'
                            ? 'Ventas Concretadas'
                            : 'Operaciones Registradas'
                        }
                        fill={COLORES_GRAFICO.terracota}
                        radius={[4, 4, 0, 0]}
                      />
                      {(reporte.enfoque_principal === 'clientes' || reporte.enfoque_principal === 'cotizaciones') && (
                        <Bar
                          dataKey="secundario"
                          name={
                            reporte.enfoque_principal === 'clientes'
                              ? 'Seguimiento Cartera'
                              : 'Cotizaciones en Proceso'
                          }
                          fill={COLORES_GRAFICO.verdeBosque}
                          radius={[4, 4, 0, 0]}
                        />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico 2: Actividad por Usuario Responsable */}
              <div
                style={{
                  background: 'var(--bg-app)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  border: '1px solid var(--border-soft)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Actividad por Usuario Responsable
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Colaboradores y asesores activos
                  </span>
                </div>

                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={datosGraficoUsuarios}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }: any) =>
                          `${(name ? String(name) : '').split(' ')[0]} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {datosGraficoUsuarios.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#2C221E',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen Ejecutivo */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-soft)',
              borderRadius: '12px',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <div style={{ width: '4px', height: '18px', background: '#C85A32', borderRadius: '2px' }} />
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Evaluación y Diagnóstico Comercial
              </h4>
            </div>

            <p style={{ fontSize: '13.5px', lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-line', margin: 0 }}>
              {reporte.resumen_ejecutivo}
            </p>

            {reporte.diagnostico_salud && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(200, 90, 50, 0.06)',
                  border: '1px solid rgba(200, 90, 50, 0.2)',
                  fontSize: '12.5px',
                  color: 'var(--text-primary)',
                }}
              >
                <strong>Diagnóstico de Salud: </strong>
                {reporte.diagnostico_salud}
              </div>
            )}
          </div>

          {/* Insights Clave */}
          {reporte.insights && reporte.insights.length > 0 && (
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-soft)',
                borderRadius: '12px',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <div style={{ width: '4px', height: '18px', background: '#C85A32', borderRadius: '2px' }} />
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Insights y Oportunidades ({reporte.insights.length})
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {reporte.insights.map((ins, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-soft)',
                      background: 'var(--bg-app)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {ins.titulo}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color:
                            ins.tipo === 'Alerta Comercial'
                              ? '#DC2626'
                              : ins.tipo === 'Logro'
                              ? '#16A34A'
                              : '#C85A32',
                        }}
                      >
                        {ins.tipo?.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {ins.descripcion}
                    </p>
                    {ins.impacto_comercial && (
                      <div style={{ marginTop: '4px', fontSize: '11.5px', color: '#C85A32', fontWeight: 600 }}>
                        Impacto Comercial: {ins.impacto_comercial}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estrategias y Recomendaciones */}
          {reporte.estrategias_recomendadas && reporte.estrategias_recomendadas.length > 0 && (
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-soft)',
                borderRadius: '12px',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                <div style={{ width: '4px', height: '18px', background: '#C85A32', borderRadius: '2px' }} />
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Iniciativas Comerciales Recomendadas
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {reporte.estrategias_recomendadas.map((est, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-soft)',
                      fontSize: '12.5px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 5px',
                          borderRadius: '3px',
                          color: '#FFFFFF',
                          background:
                            est.prioridad?.toLowerCase() === 'alta'
                              ? '#DC2626'
                              : est.prioridad?.toLowerCase() === 'media'
                              ? '#D97706'
                              : '#16A34A',
                        }}
                      >
                        {est.prioridad?.toUpperCase() || 'MEDIA'}
                      </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{est.estrategia}</strong>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '11.5px' }}>
                      {est.beneficio_esperado}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
