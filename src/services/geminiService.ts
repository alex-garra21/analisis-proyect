import type { AuditoriaRegistro, ReporteInteligenteGerenciaVista, InventarioEstadoActualVista, DatosMaestrosDistribuidora } from '../types/database';
import { supabase } from '../utils/supabase';

export type EnfoqueComercial =
  | 'ingreso_mercaderia'
  | 'ajuste_stock'
  | 'nueva_mercaderia'
  | 'modificacion_precios'
  | 'inventario'
  | 'categorias'
  | 'unidades_medida'
  | 'clientes'
  | 'cotizaciones'
  | 'usuarios'
  | 'catalogo'
  | 'general';

export interface MetricaDinamica {
  label: string;
  valor: string | number;
  cambio?: string;
  interpretacion?: string;
}

export interface MetricasGerencialesIA {
  total_operaciones_analizadas: number;
  colaboradores_activos: number;
  areas_comerciales_clave: string[];
  cotizaciones_movimientos: number;
  movimientos_inventario: number;
  actualizaciones_catalogo: number;
  clientes_gestionados: number;
}

export interface InsightComercialIA {
  titulo: string;
  area: string;
  tipo: 'Oportunidad' | 'Alerta Comercial' | 'Logro' | 'Estratégico';
  descripcion: string;
  impacto_comercial: string;
}

export interface EstrategiaRecomendadaIA {
  prioridad: 'Alta' | 'Media' | 'Baja';
  area: string;
  estrategia: string;
  beneficio_esperado: string;
}

export interface ReporteGerencialIA {
  titulo: string;
  enfoque_principal: EnfoqueComercial;
  respuesta_directa: string;
  periodo: string;
  fecha_generacion: string;
  modelo_utilizado: string;
  salud_comercial: 'Excelente' | 'Favorable' | 'Moderada' | 'En Riesgo';
  diagnostico_salud: string;
  resumen_ejecutivo: string;
  metricas_especificas: MetricaDinamica[];
  metricas: MetricasGerencialesIA;
  insights: InsightComercialIA[];
  analisis_tendencias_mercado: string;
  estrategias_recomendadas: EstrategiaRecomendadaIA[];
  conclusion_gerencial: string;
}

export type ReporteAuditoriaIA = ReporteGerencialIA;

export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';
export const FALLBACK_GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

/**
 * Detecta la intención principal o foco temático de la consulta del usuario,
 * priorizando operaciones específicas del sistema para evitar rellenos o desvíos.
 */
export function detectarEnfoqueConsulta(prompt: string): EnfoqueComercial {
  const p = prompt.toLowerCase();

  // 1. Categorías y Unidades de Medida (Mantenimiento del catálogo)
  if (
    p.includes('unidad de medida') ||
    p.includes('unidades de medida') ||
    p.includes('unidad medida') ||
    p.includes('unidades medida')
  ) {
    return 'unidades_medida';
  }

  if (
    p.includes('categoria') ||
    p.includes('categoría') ||
    p.includes('categorias') ||
    p.includes('categorías')
  ) {
    return 'categorias';
  }

  // 2. Gestión de Usuarios, Colaboradores y Roles
  if (
    p.includes('usuario') ||
    p.includes('colaborador') ||
    p.includes('rol') ||
    p.includes('roles') ||
    p.includes('acceso') ||
    p.includes('permiso') ||
    p.includes('baja de usuario') ||
    p.includes('alta de usuario')
  ) {
    return 'usuarios';
  }

  // 3. Ingreso de Mercadería (Modal de Ajuste de Stock e Inventario)
  if (
    p.includes('ingreso de mercader') ||
    p.includes('ingresos de mercader') ||
    p.includes('ingreso de producto') ||
    p.includes('ingresos de producto') ||
    p.includes('ingreso de stock') ||
    p.includes('entrada de stock') ||
    p.includes('entrada de mercader') ||
    p.includes('recepcion de mercader') ||
    p.includes('recepción de mercader') ||
    (p.includes('ingreso') &&
      (p.includes('stock') ||
        p.includes('mercader') ||
        p.includes('bodega') ||
        p.includes('almacen') ||
        p.includes('almacén')))
  ) {
    return 'ingreso_mercaderia';
  }

  // 4. Ajuste de Stock / Devolución / Retiro (Modal de Ajuste de Stock e Inventario)
  if (
    p.includes('ajuste de stock') ||
    p.includes('ajustes de stock') ||
    p.includes('ajuste de inventario') ||
    p.includes('ajustes de inventario') ||
    p.includes('devolucion') ||
    p.includes('devolución') ||
    p.includes('retiro') ||
    p.includes('salida de stock') ||
    p.includes('merma')
  ) {
    return 'ajuste_stock';
  }

  // 5. Nueva Mercadería (Botón 'Nueva Mercadería' en catálogo)
  if (
    p.includes('nueva mercaderia') ||
    p.includes('nueva mercadería') ||
    p.includes('nuevas mercaderias') ||
    p.includes('nuevo producto') ||
    p.includes('nuevos productos') ||
    p.includes('alta de mercader') ||
    p.includes('alta de producto') ||
    p.includes('crear mercader') ||
    p.includes('registro de mercader') ||
    p.includes('boton nueva mercader') ||
    p.includes('botón nueva mercader')
  ) {
    return 'nueva_mercaderia';
  }

  // 6. Modificación de Precios (Precios unitarios en inventario o catálogo)
  if (
    p.includes('modificacion de precio') ||
    p.includes('modificación de precio') ||
    p.includes('cambio de precio') ||
    p.includes('cambios de precio') ||
    p.includes('ajuste de precio') ||
    p.includes('ajustes de precio') ||
    p.includes('actualizacion de precio') ||
    p.includes('actualización de precio') ||
    p.includes('precio unitario') ||
    p.includes('precios unitarios') ||
    (p.includes('precio') && !p.includes('cotiza'))
  ) {
    return 'modificacion_precios';
  }

  // 7. Inventario general y existencias
  if (
    p.includes('inventario') ||
    p.includes('stock') ||
    p.includes('existencia') ||
    p.includes('bodega') ||
    p.includes('almacen') ||
    p.includes('almacén') ||
    p.includes('abastec') ||
    p.includes('reposici')
  ) {
    return 'inventario';
  }

  // 8. Cartera de Clientes
  if (
    p.includes('cliente') ||
    p.includes('cartera') ||
    p.includes('comprador') ||
    p.includes('prospecto') ||
    p.includes('fideliz')
  ) {
    return 'clientes';
  }

  // 9. Flujo de Cotizaciones y Cierres Comerciales (Ventas)
  if (
    p.includes('cotiza') ||
    p.includes('venta') ||
    p.includes('cierre') ||
    p.includes('pipeline') ||
    p.includes('rechaz') ||
    p.includes('aproba') ||
    p.includes('ingresos financieros') ||
    p.includes('ingresos por venta') ||
    p.includes('ingresos logrados') ||
    p.includes('ingreso monetario') ||
    p.includes('quetzales')
  ) {
    return 'cotizaciones';
  }

  // 10. Catálogo de Mercaderías en general
  if (
    p.includes('catalogo') ||
    p.includes('catálogo') ||
    p.includes('producto') ||
    p.includes('mercaderia') ||
    p.includes('mercadería') ||
    p.includes('papeleria') ||
    p.includes('papelería') ||
    p.includes('suministro') ||
    p.includes('utiles') ||
    p.includes('útiles') ||
    p.includes('insumo')
  ) {
    return 'catalogo';
  }

  return 'general';
}

export function getGeminiApiKey(): string {
  return (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
}

/**
 * Verifica si existe una API Key de Google Gemini disponible en el entorno (.env.local).
 */
export function hasGeminiApiKey(): boolean {
  return Boolean(getGeminiApiKey());
}

/**
 * System Prompt: Asesor Senior de Negocios y Gerente Comercial de "Comercial Flores del Campo".
 * Perfil de Identidad: Comercializadora líder en Guatemala de suministros comerciales, papelería,
 * útiles escolares e insumos de oficina (ACLARACIÓN ESTRICTA: NO es una floristería ni comercializa flores).
 * Respuestas ceñidas con rigor directivo a lo consultado, con cero relleno,
 * definiciones operativas de inventario y regla de cotizaciones aprobadas = ventas despachadas.
 */
const ASESOR_GERENCIAL_SYSTEM_PROMPT = `Eres el Asesor Senior de Negocios y Gerente Comercial de "Comercial Flores del Campo", empresa guatemalteca especializada en la comercialización y distribución mayorista y minorista de suministros de oficina, papelería institucional, útiles escolares y artículos comerciales para entidades, empresas y colegios en Guatemala.

IDENTIDAD Y GIRO DE NEGOCIO ESTRICTO (OBLIGATORIO):
- "Comercial Flores del Campo" es EXCLUSIVAMENTE una comercializadora y distribuidora de SUMINISTROS, PAPELERÍA Y MATERIALES DE OFICINA.
- BAJO NINGUNA CIRCUNSTANCIA es una floristería, ni comercializa flores, plantas ni arreglos florales. Cualquier referencia a inventario o catálogo debe entenderse siempre en el rubro de útiles, papelería, archivo y suministros comerciales.

REGLAS DE COMPORTAMIENTO DIRECTIVO Y EXACTITUD ESTRICTA:

1. DETECCIÓN DE CONSULTAS PUNTUALES VS. INFORMES ESTRATÉGICOS:
   - CONSULTAS PUNTUALES O DE VERIFICACIÓN:
     * Si la consulta es una pregunta cerrada, de validación o un dato puntual (ej. "¿Hay clientes en Chisec?", "¿Existe el producto X?", "¿Cuál es el precio de X?", "¿Tenemos clientes registrados en Cobán?"):
       - La respuesta directa ("respuesta_directa") y el resumen ("resumen_ejecutivo") deben ser CORTOS, EXACTOS Y CONCRETOS.
       - Responde estrictamente lo que se pide, contrastando los datos textuales con los registros provistos (ej. confirmando o desmintiendo la ubicación, existencia o precio).
       - PROHIBIDO TERMINANTEMENTE recurrir a discursos corporativos de relleno, retórica vacía o hablar de "estrategias de expansión nacional" cuando se consulta por una localidad o dato específico.
   - INFORMES ESTRATÉGICOS O GLOBALES:
     * Solo si el usuario solicita un panorama general, análisis de tendencias o informe operativo (ej. "¿Cómo va la operación esta semana?", "¿Cuál es el balance comercial?", "¿Qué se ha vendido?"), elabora un análisis ejecutivo profundo correlacionando las distintas áreas.

2. VALIDACIÓN DE DATOS REALES (CERO ALUCINACIONES Y CERO SUPOSICIONES):
   - Basa tus respuestas EXCLUSIVAMENTE en la evidencia fáctica provista en los registros y métricas de la distribuidora.
   - Si la base de datos contiene registros específicos (por ejemplo, un cliente registrado en Raxruhá) y el usuario pregunta por otra ubicación distinta (ej. "¿Hay clientes en Chisec?"), debes CONTRASTAR TEXTUALMENTE:
     * Aclara con total transparencia que en la base de datos NO figura ningún cliente en Chisec, indicando qué clientes o ubicaciones sí están registrados realmente (ej. "Actualmente no se registran clientes en el municipio de Chisec; el único registro de cliente corresponde a Raxruhá").
     * NO inventes clientes, no supongas sucursales y no agregues tendencias de mercado ficticias.

3. VISIÓN INTEGRAL BASADA EN VISTAS MAESTRAS UNIFICADAS:
   - Tienes acceso simultáneo al estado consolidado de las 4 vistas maestras del negocio:
     1. vw_inventario_y_estado_actual: Catálogo maestro con la totalidad de productos, su stock_actual real en bodega, categorías, unidades de medida y precios unitarios.
     2. vw_resumen_comercial_global: Cartera consolidada de cotizaciones emitidas, estados (aprobadas/pendientes) y clientes vinculados.
     3. vw_categorias_actuales y vw_unidades_medida_actuales: Estructura viva del catálogo de suministros y papelería.
     4. vw_reportes_inteligentes_gerencia: Historial de movimientos y eventos de auditoría operativa.
   - REGLA DE ORO DE INVENTARIO (CERO OMISIONES):
     * Cuando el usuario consulte sobre inventario, stock, existencias o catálogo, DEBES ENUMERAR Y DESCRIBIR LA TOTALIDAD DE LOS ARTÍCULOS REGISTRADOS en la bodega a partir de vw_inventario_y_estado_actual.
     * Calcula la valoración económica total del inventario en Quetzales (suma de stock_actual * precio_unitario).
     * PROHIBIDO TERMINANTEMENTE omitir productos por el hecho de no tener eventos recientes en la auditoría: el listado maestro de bodega es la verdad fáctica absoluta de las existencias.
   - COTIZACIONES APROBADAS = VENTAS REALES DESPACHADAS: Toda cotización aprobada representa ventas concretadas e ingresos generados en Quetzales (Q.).
   - NUNCA uses terminología técnica de bases de datos o sistemas (evita hablar de vistas, inserts, updates, triggers o tablas). Redacta en lenguaje ejecutivo de alta dirección comercial.

FORMATO DE SALIDA ESTRICTO EN JSON (sin bloques markdown \`\`\`json):
{
  "titulo": "Título ejecutivo conciso y directo",
  "enfoque_principal": "general" | "cotizaciones" | "inventario" | "ingreso_mercaderia" | "ajuste_stock" | "nueva_mercaderia" | "modificacion_precios" | "categorias" | "unidades_medida" | "clientes" | "usuarios" | "catalogo",
  "respuesta_directa": "Respuesta directa, ejecutiva y concreta respondiendo exactamente lo consultado...",
  "periodo": "Periodo analizado...",
  "salud_comercial": "Excelente" | "Favorable" | "Moderada" | "En Riesgo",
  "diagnostico_salud": "Diagnóstico breve y fáctico sobre el tema consultado...",
  "resumen_ejecutivo": "Explicación clara y directa sustentada en los datos reales. Para preguntas puntuales debe ser breve y sin relleno retórico...",
  "metricas_especificas": [
    {
      "label": "Nombre del indicador",
      "valor": "Valor numérico, conteo o monto en Q.",
      "cambio": "Estado fáctico",
      "interpretacion": "Interpretación gerencial puntual"
    }
  ],
  "metricas": {
    "total_operaciones_analizadas": 0,
    "colaboradores_activos": 0,
    "areas_comerciales_clave": ["Áreas evaluadas"],
    "cotizaciones_movimientos": 0,
    "movimientos_inventario": 0,
    "actualizaciones_catalogo": 0,
    "clientes_gestionados": 0
  },
  "insights": [
    {
      "titulo": "Título del hallazgo fáctico",
      "area": "Área involucrada",
      "tipo": "Oportunidad" | "Alerta Comercial" | "Logro" | "Estratégico",
      "descripcion": "Descripción real basada en la evidencia...",
      "impacto_comercial": "Impacto medible en el negocio..."
    }
  ],
  "analisis_tendencias_mercado": "Contexto comercial real y conciso (si es consulta puntual, ceñirse a la realidad del dato sin discursos genéricos)...",
  "estrategias_recomendadas": [
    {
      "prioridad": "Alta" | "Media" | "Baja",
      "area": "Área de aplicación",
      "estrategia": "Iniciativa comercial realista...",
      "beneficio_esperado": "Impacto tangible..."
    }
  ],
  "conclusion_gerencial": "Conclusión ejecutiva directa sin rellenos..."
}`;

export function normalizarRegistroGerencial(r: ReporteInteligenteGerenciaVista | AuditoriaRegistro) {
  const fecha = r.created_at;
  const usuario =
    (r as any).usuario_responsable ||
    (r as any).usuarios?.nombre ||
    (r as any).usuarios?.correo ||
    'Equipo Comercial';
  const detalle =
    (r as any).detalle_comercial_amigable ||
    (r as any).descripcion ||
    'Operación comercial registrada.';

  return {
    fecha,
    modulo: r.modulo,
    usuario_responsable: usuario,
    detalle_comercial_amigable: detalle,
  };
}

/**
 * Realiza la llamada a la API REST de Google Gemini para un modelo específico.
 */
async function callGeminiApi(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<{ text: string; modelUsed: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      response_mime_type: 'application/json',
      temperature: 0.2,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    const message =
      errorJson?.error?.message ||
      `Error ${response.status}: ${response.statusText || 'Error en Gemini API'}`;
    const err = new Error(message) as any;
    err.status = response.status;
    throw err;
  }

  const jsonRes = await response.json();
  const text = jsonRes?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!text) {
    throw new Error(`Google Gemini (${model}) no devolvió contenido.`);
  }

  return { text, modelUsed: model };
}


/**
 * Recolecta en paralelo utilizando Promise.all el estado consolidado de todas las vistas
 * maestras de Supabase para alimentar el contexto analítico de la IA:
 * 1. vw_inventario_y_estado_actual (Inventario completo, existencias y precios)
 * 2. vw_resumen_comercial_global (Cotizaciones y clientes vinculados)
 * 3. vw_categorias_actuales (Familias de productos activas)
 * 4. vw_unidades_medida_actuales (Unidades de medida)
 */
export async function recolectarDatosGlobalesDistribuidora(): Promise<DatosMaestrosDistribuidora> {
  try {
    const [invRes, comRes, catRes, uniRes] = await Promise.all([
      supabase.from('vw_inventario_y_estado_actual').select('*'),
      supabase.from('vw_resumen_comercial_global').select('*'),
      supabase.from('vw_categorias_actuales').select('*'),
      supabase.from('vw_unidades_medida_actuales').select('*'),
    ]);

    return {
      inventario: (invRes.data || []) as InventarioEstadoActualVista[],
      resumenComercial: comRes.data || [],
      categorias: catRes.data || [],
      unidadesMedida: uniRes.data || [],
    };
  } catch (err) {
    console.warn('Advertencia recolectando datos maestros en paralelo:', err);
    return {
      inventario: [],
      resumenComercial: [],
      categorias: [],
      unidadesMedida: [],
    };
  }
}

export interface SolicitudAuditoriaInput {
  promptUsuario: string;
  totalRegistrosEnBd: number;
}

/**
 * Genera el análisis gerencial enfocado dinámicamente según la pregunta del usuario,
 * procesando los datos limpios de la vista vw_reportes_inteligentes_gerencia con
 * filtrado estricto por intención y cero información de relleno.
 */
export async function generarAnalisisAuditoriaIA(
  registros: (ReporteInteligenteGerenciaVista | AuditoriaRegistro)[],
  solicitud: SolicitudAuditoriaInput,
  datosMaestrosOInventario?: DatosMaestrosDistribuidora | InventarioEstadoActualVista[],
  modelName: string = DEFAULT_GEMINI_MODEL
): Promise<ReporteGerencialIA> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      'No se encontró la variable VITE_GEMINI_API_KEY configurada en el archivo .env.local.'
    );
  }

  if (!registros || registros.length === 0) {
    throw new Error('No hay registros de actividad comercial disponibles en el sistema para analizar.');
  }

  // 1. Detectar intención primordial para orientar la síntesis (pero sin aislar la muestra)
  const enfoqueDetectado = detectarEnfoqueConsulta(solicitud.promptUsuario);

  // 2. Consulta Global Multi-Módulo:
  // Proporcionamos la totalidad de los eventos recientes de la distribuidora para visión holística
  const registrosFiltrados = registros;

  // Conteos contextuales limpios en todos los módulos
  const totalCotizaciones = registros.filter((r) =>
    String(r.modulo || '').toLowerCase().includes('cotiza')
  ).length;

  const totalInventario = registros.filter((r) => {
    const mod = String(r.modulo || '').toLowerCase();
    return mod.includes('inventario') || mod.includes('ajuste');
  }).length;

  const totalMercaderias = registros.filter((r) => {
    const mod = String(r.modulo || '').toLowerCase();
    return (
      mod.includes('mercader') ||
      mod.includes('catálogo') ||
      mod.includes('catalogo') ||
      mod.includes('categor') ||
      mod.includes('unidad')
    );
  }).length;

  const totalClientes = registros.filter((r) =>
    String(r.modulo || '').toLowerCase().includes('cliente')
  ).length;

  const totalUsuarios = registros.filter((r) => {
    const mod = String(r.modulo || '').toLowerCase();
    const det = String((r as any).detalle_comercial_amigable || r.descripcion || '').toLowerCase();
    return mod.includes('usuario') || mod.includes('rol') || det.includes('usuario') || det.includes('rol');
  }).length;

  const colaboradoresSet = new Set<string>();
  registros.forEach((r: any) => {
    const u = r.usuario_responsable || r.usuarios?.nombre || r.usuarios?.correo;
    if (u) colaboradoresSet.add(u);
  });

  // Normalizar datos limpios para la IA (muestra completa representativa de hasta 180 eventos recientes)
  const datosComercialesLimpio = registros.slice(0, 180).map(normalizarRegistroGerencial);

  // Armar contexto ejecutivo con métricas de toda la organización
  const metricasContexto: string[] = [
    `- Total operaciones evaluadas en la distribuidora: ${registros.length}`,
    `- Colaboradores activos involucrados: ${colaboradoresSet.size}`,
    `- Movimientos de cotizaciones / ventas registradas: ${totalCotizaciones}`,
    `- Movimientos de stock e inventario en bodega: ${totalInventario}`,
    `- Movimientos en catálogo de productos y suministros: ${totalMercaderias}`,
    `- Movimientos en cartera de clientes: ${totalClientes}`,
    `- Operaciones de usuarios y roles institucionales: ${totalUsuarios}`,
  ];

  // Normalizar datos de las tablas maestras
  let inventarioActual: InventarioEstadoActualVista[] = [];
  let resumenComercial: any[] = [];
  let categoriasActuales: any[] = [];
  let unidadesActuales: any[] = [];

  if (Array.isArray(datosMaestrosOInventario)) {
    inventarioActual = datosMaestrosOInventario;
  } else if (datosMaestrosOInventario) {
    inventarioActual = datosMaestrosOInventario.inventario || [];
    resumenComercial = datosMaestrosOInventario.resumenComercial || [];
    categoriasActuales = datosMaestrosOInventario.categorias || [];
    unidadesActuales = datosMaestrosOInventario.unidadesMedida || [];
  }

  // Si no se proporcionaron datos maestros y la consulta los requiere, recolectar en tiempo real con Promise.all
  if (inventarioActual.length === 0 && (enfoqueDetectado === 'inventario' || solicitud.promptUsuario.toLowerCase().includes('stock') || solicitud.promptUsuario.toLowerCase().includes('inventario'))) {
    try {
      const maestros = await recolectarDatosGlobalesDistribuidora();
      inventarioActual = maestros.inventario;
      resumenComercial = maestros.resumenComercial;
      categoriasActuales = maestros.categorias;
      unidadesActuales = maestros.unidadesMedida;
    } catch (e) {
      console.warn('No se pudo autocompletar datos maestros:', e);
    }
  }

  const bloqueInventarioActual =
    inventarioActual && inventarioActual.length > 0
      ? `1. LISTADO CONSOLIDADO DE INVENTARIO Y EXISTENCIAS REALES EN BODEGA (vw_inventario_y_estado_actual - ${inventarioActual.length} artículos registrados):\n` +
        JSON.stringify(
          inventarioActual.map((p) => ({
            codigo: p.codigo_mercaderia,
            producto: p.nombre,
            stock_actual: p.stock_actual,
            precio_unitario: p.precio_unitario,
            categoria: p.categoria || p.categoria_nombre || 'General',
            unidad_medida: p.unidad_medida || p.unidad_nombre || 'Unidad',
            valoracion_total_quetzales: (p.stock_actual * p.precio_unitario).toFixed(2),
          })),
          null,
          2
        ) +
        '\n\n'
      : '';

  const bloqueComercialActual =
    resumenComercial && resumenComercial.length > 0
      ? `2. RESUMEN COMERCIAL GLOBAL (vw_resumen_comercial_global - ${resumenComercial.length} cotizaciones y clientes vinculados):\n` +
        JSON.stringify(resumenComercial.slice(0, 30), null, 2) +
        '\n\n'
      : '';

  const bloqueCatalogoEstructura =
    categoriasActuales.length > 0 || unidadesActuales.length > 0
      ? `3. ESTRUCTURA DEL CATÁLOGO (vw_categorias_actuales y vw_unidades_medida_actuales):\n` +
        JSON.stringify({
          categorias_activas: categoriasActuales.map((c) => c.nombre),
          unidades_medida: unidadesActuales.map((u) => u.nombre || u.abreviatura),
        }, null, 2) +
        '\n\n'
      : '';

  const userPromptContent = `SOLICITUD / CONSULTA DIRECTIVA:
"${solicitud.promptUsuario.trim()}"

ENFOQUE DETECTADO DE LA PREGUNTA: ${enfoqueDetectado.toUpperCase()}

${bloqueInventarioActual}${bloqueComercialActual}${bloqueCatalogoEstructura}PANORAMA GLOBAL DE OPERACIONES EN LA DISTRIBUIDORA:
${metricasContexto.join('\n')}

REGISTRO DE EVENTOS COMERCIALES RECIENTES EN TODAS LAS ÁREAS (Muestra: ${datosComercialesLimpio.length} eventos):
${JSON.stringify(datosComercialesLimpio, null, 2)}

DIRECTRICES DE EXACTITUD Y PROMPT ENGINEERING:
1. IDENTIDAD DE EMPRESA: "Comercial Flores del Campo" distribuye SUMINISTROS DE OFICINA Y PAPELERÍA en Guatemala (NO comercializa flores).
2. CONSULTAS PUNTUALES VS. INFORMES:
   - Si la consulta es puntual (ej. "¿Hay clientes en Chisec?", "¿Cuál es el precio de X?"), responde de manera CORTA, PRECISA y DIRECTA sin relleno corporativo ni discursos de expansión genérica.
   - Contrasta los datos fácticos textualmente: si en los registros solo figura un cliente en Raxruhá y preguntan por Chisec, indica textualmente que NO hay clientes en Chisec y menciona la ubicación real que sí existe.
3. CERO ALUCINACIONES: Prohibido inventar datos, clientes, precios o tendencias no fundamentadas en los registros provistos.
4. INVENTARIO CONSOLIDADO Y CORRELACIÓN MULTI-MÓDULO:
   - Si la consulta es sobre inventario, stock o existencias, analiza prioritariamente el listado consolidado de bodega provisto (vw_inventario_y_estado_actual). Reporta la totalidad de artículos, sus unidades en stock y la valoración económica total en Quetzales sin omitir productos.
   - En preguntas operativas globales, correlaciona cotizaciones aprobadas (ventas concretadas despachadas), existencias actuales y catálogo.
5. Devuelve estrictamente el JSON estructurado solicitado sin bloques markdown.
`;

  let responseText = '';
  let activeModel = modelName;

  const modelsToTry = [
    modelName,
    ...FALLBACK_GEMINI_MODELS.filter((m) => m !== modelName),
  ];

  let lastError: any = null;

  for (const currentModel of modelsToTry) {
    try {
      const res = await callGeminiApi(apiKey, currentModel, ASESOR_GERENCIAL_SYSTEM_PROMPT, userPromptContent);
      responseText = res.text;
      activeModel = res.modelUsed;
      lastError = null;
      break;
    } catch (err: any) {
      lastError = err;
      console.warn(`Intento con ${currentModel} falló:`, err.message);
      if (err.status === 404) {
        continue;
      }
      throw new Error(`Error en Google Gemini: ${err.message}`);
    }
  }

  if (lastError && !responseText) {
    throw new Error(`Error en la API de Google Gemini: ${lastError.message}`);
  }

  let sanitizedText = responseText.trim();
  if (sanitizedText.startsWith('```')) {
    sanitizedText = sanitizedText.replace(/^```(json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  let parsed: any;
  try {
    parsed = JSON.parse(sanitizedText);
  } catch (err) {
    console.error('Error parseando JSON de Gemini:', sanitizedText);
    throw new Error('La respuesta de Google Gemini no pudo ser interpretada como JSON estructurado.');
  }

  const saludValida: 'Excelente' | 'Favorable' | 'Moderada' | 'En Riesgo' =
    ['Excelente', 'Favorable', 'Moderada', 'En Riesgo'].includes(parsed.salud_comercial)
      ? parsed.salud_comercial
      : 'Favorable';

  const enfoquesPermitidos: EnfoqueComercial[] = [
    'general',
    'cotizaciones',
    'inventario',
    'ingreso_mercaderia',
    'ajuste_stock',
    'nueva_mercaderia',
    'modificacion_precios',
    'categorias',
    'unidades_medida',
    'clientes',
    'usuarios',
    'catalogo',
  ];

  const enfoqueFinal: EnfoqueComercial = enfoquesPermitidos.includes(parsed.enfoque_principal)
    ? parsed.enfoque_principal
    : enfoqueDetectado;

  let metricasEspecificas: MetricaDinamica[] = Array.isArray(parsed.metricas_especificas)
    ? parsed.metricas_especificas
    : [];

  if (metricasEspecificas.length === 0) {
    metricasEspecificas = [
      { label: 'Total Operaciones Evaluadas', valor: registros.length, interpretacion: 'Actividad global en distribuidora' },
      { label: 'Movimientos de Cotizaciones / Ventas', valor: totalCotizaciones, interpretacion: 'Cierres y presupuestos' },
      { label: 'Movimientos de Inventario', valor: totalInventario, interpretacion: 'Entradas y salidas de stock' },
      { label: 'Cartera de Clientes Atendida', valor: totalClientes, interpretacion: 'Gestión comercial' },
    ];
  }

  const reporteFinal: ReporteGerencialIA = {
    titulo: parsed.titulo || `Informe Ejecutivo de ${enfoqueFinal.toUpperCase().replace('_', ' ')}`,
    enfoque_principal: enfoqueFinal,
    respuesta_directa: parsed.respuesta_directa || 'Análisis completado para la consulta comercial.',
    periodo: parsed.periodo || 'Actividad Reciente',
    fecha_generacion: new Date().toLocaleDateString('es-GT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    modelo_utilizado: activeModel,
    salud_comercial: saludValida,
    diagnostico_salud:
      parsed.diagnostico_salud ||
      'Evaluación gerencial favorable en base a las operaciones registradas.',
    resumen_ejecutivo:
      parsed.resumen_ejecutivo ||
      'El análisis refleja la actividad comercial registrada según los parámetros de la consulta.',
    metricas_especificas: metricasEspecificas,
    metricas: {
      total_operaciones_analizadas: registrosFiltrados.length,
      colaboradores_activos: colaboradoresSet.size,
      areas_comerciales_clave: Array.isArray(parsed.metricas?.areas_comerciales_clave)
        ? parsed.metricas.areas_comerciales_clave
        : [enfoqueFinal],
      cotizaciones_movimientos: totalCotizaciones,
      movimientos_inventario: totalInventario,
      actualizaciones_catalogo: totalMercaderias,
      clientes_gestionados: totalClientes,
    },
    insights: Array.isArray(parsed.insights) ? parsed.insights : [],
    analisis_tendencias_mercado:
      parsed.analisis_tendencias_mercado ||
      'El comportamiento comercial mantiene alineación con la demanda habitual de la distribuidora.',
    estrategias_recomendadas: Array.isArray(parsed.estrategias_recomendadas)
      ? parsed.estrategias_recomendadas
      : [],
    conclusion_gerencial:
      parsed.conclusion_gerencial ||
      'Se recomienda continuar con el monitoreo operativo y supervisión de los movimientos comerciales.',
  };

  return reporteFinal;
}
