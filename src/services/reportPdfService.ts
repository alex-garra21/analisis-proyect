import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ReporteGerencialIA } from './geminiService';

export interface GenerarPdfParams {
  reporte: ReporteGerencialIA;
  usuarioResponsable: {
    nombre: string;
    correo: string;
    rol: string;
  };
  graficosImagenes?: {
    generalImg?: string | null;
    tendenciaImg?: string | null;
    areasImg?: string | null;
  };
}

/**
 * Formatea una fecha ISO a formato local legible con segundos.
 */
function formatearFechaConSegundos(isoStr: string | null | undefined): string {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
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
    return isoStr;
  }
}

/**
 * Genera y descarga un informe gerencial adaptativo en PDF,
 * integrando la lectura directa de la vista vw_reportes_inteligentes_gerencia,
 * gráficos interactivos y métricas específicas.
 */
export async function exportarReporteAuditoriaPdf({
  reporte,
  usuarioResponsable,
  graficosImagenes,
}: GenerarPdfParams): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;

  // Paleta corporativa Flores del Campo
  const COLOR_TERRACOTA = [200, 90, 50] as [number, number, number]; // #C85A32
  const COLOR_ESPRESSO = [44, 34, 30] as [number, number, number]; // #2C221E
  const COLOR_SECONDARY = [124, 110, 103] as [number, number, number]; // #7C6E67
  const COLOR_CREAM = [253, 251, 247] as [number, number, number]; // #FDFBF7
  const COLOR_BORDER = [230, 223, 213] as [number, number, number]; // #E6DFD5

  // Colores para Salud Comercial
  const getHealthColor = (salud: string): [number, number, number] => {
    switch (salud?.toLowerCase()) {
      case 'excelente':
        return [22, 163, 74];
      case 'favorable':
        return [42, 157, 143];
      case 'moderada':
        return [217, 119, 6];
      case 'en riesgo':
      default:
        return [220, 38, 38];
    }
  };

  let currentY = 0;

  // 1. Barra decorativa superior
  doc.setFillColor(...COLOR_TERRACOTA);
  doc.rect(0, 0, pageWidth, 5, 'F');

  currentY = 14;

  // 2. Encabezado Corporativo y Directivo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLOR_TERRACOTA);
  doc.text('COMERCIAL FLORES DEL CAMPO', marginX, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_SECONDARY);
  doc.text(
    'BARRIO SANTAMARÍA, RAXRUHÁ, A.V. | INFORME EJECUTIVO ENFOCADO',
    marginX,
    currentY + 4.5
  );

  const fechaGeneracionFormateada = formatearFechaConSegundos(reporte.fecha_generacion);
  doc.setFontSize(8);
  doc.text(`Emisión: ${fechaGeneracionFormateada}`, pageWidth - marginX, currentY, {
    align: 'right',
  });
  doc.text('Carácter: Confidencial Directivo', pageWidth - marginX, currentY + 4.5, {
    align: 'right',
  });

  currentY += 10;

  doc.setDrawColor(...COLOR_BORDER);
  doc.setLineWidth(0.4);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  currentY += 5;

  // 3. Ficha Principal del Título
  doc.setFillColor(...COLOR_CREAM);
  doc.setDrawColor(...COLOR_TERRACOTA);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, currentY, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_ESPRESSO);
  doc.text(reporte.titulo.toUpperCase(), marginX + 4, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_SECONDARY);
  doc.text(
    `Análisis focalizado en ${reporte.enfoque_principal.toUpperCase()} • Asistido por Google Gemini (${reporte.modelo_utilizado})`,
    marginX + 4,
    currentY + 13
  );

  currentY += 23;

  // 4. BANNER: Respuesta Directa a la Consulta del Usuario
  if (reporte.respuesta_directa) {
    const lineasDirectas = doc.splitTextToSize(reporte.respuesta_directa, contentWidth - 8);
    const boxHeight = Math.max(14, lineasDirectas.length * 4.5 + 8);

    doc.setFillColor(254, 250, 246);
    doc.setDrawColor(...COLOR_TERRACOTA);
    doc.setLineWidth(0.4);
    doc.roundedRect(marginX, currentY, contentWidth, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR_TERRACOTA);
    doc.text('RESPUESTA DIRECTA A LA CONSULTA:', marginX + 4, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR_ESPRESSO);
    doc.text(lineasDirectas, marginX + 4, currentY + 10);

    currentY += boxHeight + 7;
  }

  // 5. Tabla de Ficha Técnica Ejecutiva
  const healthColor = getHealthColor(reporte.salud_comercial);

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    theme: 'plain',
    styles: {
      fontSize: 8.5,
      cellPadding: 2.2,
      textColor: COLOR_ESPRESSO,
      lineColor: COLOR_BORDER,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [247, 244, 238], cellWidth: 42 },
      1: { cellWidth: 49 },
      2: { fontStyle: 'bold', fillColor: [247, 244, 238], cellWidth: 42 },
      3: { cellWidth: 49 },
    },
    body: [
      [
        'Gerente / Emisor:',
        `${usuarioResponsable.nombre || 'Administración'} (${usuarioResponsable.rol})`,
        'Salud Comercial:',
        {
          content: reporte.salud_comercial.toUpperCase(),
          styles: { textColor: healthColor, fontStyle: 'bold' },
        },
      ],
      [
        'Correo Institucional:',
        usuarioResponsable.correo || '-',
        'Operaciones Evaluadas:',
        `${reporte.metricas.total_operaciones_analizadas} eventos`,
      ],
      [
        'Foco de Consulta:',
        reporte.enfoque_principal.toUpperCase(),
        'Periodo Evaluado:',
        reporte.periodo || 'Actividad Reciente',
      ],
    ],
  });

  currentY = (doc as any).lastAutoTable.finalY + 7;

  // Helper para títulos de sección
  const dibujarTituloSeccion = (titulo: string) => {
    if (currentY > pageHeight - 35) {
      doc.addPage();
      currentY = 16;
    }

    doc.setFillColor(...COLOR_TERRACOTA);
    doc.rect(marginX, currentY - 3.5, 2.5, 5.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...COLOR_ESPRESSO);
    doc.text(titulo, marginX + 5, currentY);

    currentY += 5;
  };

  // 6. Sección 1: Resumen Ejecutivo
  dibujarTituloSeccion('1. EVALUACIÓN Y DIAGNÓSTICO ENFOCADO');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_ESPRESSO);

  const lineasResumen = doc.splitTextToSize(reporte.resumen_ejecutivo, contentWidth);
  doc.text(lineasResumen, marginX, currentY);
  currentY += lineasResumen.length * 4.2 + 4;

  // Diagnóstico con cálculo de altura dinámica y margen inferior garantizado
  if (reporte.diagnostico_salud) {
    const diagLineas = doc.splitTextToSize(reporte.diagnostico_salud, contentWidth - 10);
    // Altura calculada dinámicamente según el número de líneas (mínimo 16mm)
    const diagBoxHeight = Math.max(16, diagLineas.length * 4.3 + 9.5);

    if (currentY + diagBoxHeight > pageHeight - 35) {
      doc.addPage();
      currentY = 16;
    }

    doc.setFillColor(254, 250, 246);
    doc.setDrawColor(...healthColor);
    doc.setLineWidth(0.4);
    doc.roundedRect(marginX, currentY, contentWidth, diagBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...healthColor);
    doc.text(`DIAGNÓSTICO [${reporte.salud_comercial.toUpperCase()}]:`, marginX + 4, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLOR_ESPRESSO);
    doc.text(diagLineas, marginX + 4, currentY + 9.5);

    // Margen inferior limpio de 8.5mm (~24px a 32px) para evitar cualquier superposición
    currentY += diagBoxHeight + 8.5;
  } else {
    currentY += 4;
  }

  // 7. Sección 2: Métricas Clave Específicas
  if (reporte.metricas_especificas && reporte.metricas_especificas.length > 0) {
    dibujarTituloSeccion('2. INDICADORES ESPECÍFICOS DE LA CONSULTA');

    const filasMetricas = reporte.metricas_especificas.map((m) => [
      m.label,
      String(m.valor),
      m.interpretacion || m.cambio || 'Indicador analizado',
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [['Indicador Clave', 'Valor Registrado', 'Interpretación Directiva']],
      body: filasMetricas,
      theme: 'striped',
      headStyles: {
        fillColor: COLOR_TERRACOTA,
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold',
        cellPadding: 2.2,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: COLOR_ESPRESSO,
      },
      alternateRowStyles: {
        fillColor: [253, 251, 247],
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 8. Sección 3: Gráficos Estadísticos
  if (graficosImagenes?.generalImg) {
    if (currentY > pageHeight - 90) {
      doc.addPage();
      currentY = 16;
    }

    dibujarTituloSeccion('3. VISUALIZACIÓN ESTADÍSTICA DEL ÁREA CONSULTADA');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_SECONDARY);
    doc.text(
      `Gráficos estadísticos correspondientes al enfoque de ${reporte.enfoque_principal}:`,
      marginX,
      currentY
    );
    currentY += 4;

    try {
      const chartWidth = contentWidth;
      const chartHeight = 75;
      doc.addImage(graficosImagenes.generalImg, 'PNG', marginX, currentY, chartWidth, chartHeight);
      currentY += chartHeight + 8;
    } catch (imgErr) {
      console.warn('Error incrustando imagen de gráficos en el PDF:', imgErr);
    }
  }

  // 9. Sección 4: Insights Comerciales
  if (reporte.insights && reporte.insights.length > 0) {
    dibujarTituloSeccion('4. INSIGHTS Y OPORTUNIDADES DETECTADAS');

    const filasInsights = reporte.insights.map((ins, i) => [
      `#${i + 1}`,
      (ins.tipo || 'Oportunidad').toUpperCase(),
      ins.titulo,
      `${ins.descripcion}${ins.impacto_comercial ? `\nImpacto Comercial: ${ins.impacto_comercial}` : ''}`,
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [['Nº', 'Tipo', 'Insight Comercial', 'Descripción e Impacto']],
      body: filasInsights,
      theme: 'grid',
      headStyles: {
        fillColor: COLOR_TERRACOTA,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        cellPadding: 2,
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: COLOR_ESPRESSO,
        lineColor: COLOR_BORDER,
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 26, fontStyle: 'bold' },
        2: { cellWidth: 42, fontStyle: 'bold' },
        3: { cellWidth: 'auto' },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 7;
  }

  // 10. Sección 5: Estrategias Recomendadas
  if (reporte.estrategias_recomendadas && reporte.estrategias_recomendadas.length > 0) {
    dibujarTituloSeccion('5. INICIATIVAS COMERCIALES RECOMENDADAS');

    const filasEstrategias = reporte.estrategias_recomendadas.map((est, i) => [
      `EST-${i + 1}`,
      (est.prioridad || 'Media').toUpperCase(),
      est.estrategia,
      est.beneficio_esperado,
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [['ID', 'Prioridad', 'Iniciativa Propuesta', 'Beneficio Proyectado']],
      body: filasEstrategias,
      theme: 'grid',
      headStyles: {
        fillColor: COLOR_TERRACOTA,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        cellPadding: 2,
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: COLOR_ESPRESSO,
        lineColor: COLOR_BORDER,
      },
      columnStyles: {
        0: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 22, fontStyle: 'bold' },
        2: { cellWidth: 65 },
        3: { cellWidth: 'auto' },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 7;
  }

  // 11. Sección 6: Conclusión Gerencial
  if (reporte.conclusion_gerencial) {
    dibujarTituloSeccion('6. CONCLUSIÓN Y DIRECTRIZ DIRECTIVA');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR_ESPRESSO);

    const lineasConclusion = doc.splitTextToSize(reporte.conclusion_gerencial, contentWidth);
    doc.text(lineasConclusion, marginX, currentY);
    currentY += lineasConclusion.length * 4.2 + 8;
  }

  // 12. Paginación y Pie de Página en todas las páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_SECONDARY);

    doc.text(
      'Comercial Flores del Campo — Gestión y Desempeño Comercial Estratégico',
      marginX,
      pageHeight - 7.5
    );

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR_TERRACOTA);
    doc.text('DOCUMENTO DE DIRECCIÓN GENERAL', pageWidth / 2, pageHeight - 7.5, {
      align: 'left',
    });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLOR_SECONDARY);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - marginX, pageHeight - 7.5, {
      align: 'right',
    });
  }

  const fechaSlug = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `Informe_Gerencial_${reporte.enfoque_principal}_${fechaSlug}.pdf`;
  doc.save(fileName);
}

export const exportarReporteGerencialPdf = exportarReporteAuditoriaPdf;
