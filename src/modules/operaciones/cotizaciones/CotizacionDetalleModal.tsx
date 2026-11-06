import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../../../components/ui/Modal';
import { useCotizacion } from '../../../api/hooks/useComercial';
import { formatQuetzales } from '../../../types/database';
import { Icons } from '../../../components/Icons';
import { supabase } from '../../../utils/supabase';
import { showToast, showConfirm } from '../../../utils/swal';

interface CotizacionDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  cotizacionId: number | null;
}

export default function CotizacionDetalleModal({
  isOpen,
  onClose,
  cotizacionId,
}: CotizacionDetalleModalProps) {
  const queryClient = useQueryClient();
  const { data: cot, isLoading } = useCotizacion(cotizacionId);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionType, setActionType] = useState<'Aprobada' | 'Rechazada' | null>(null);

  if (!cotizacionId) return null;

  const formatDateTimeWithSeconds = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return new Intl.DateTimeFormat('es-GT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(date);
    } catch {
      return '-';
    }
  };

  const handleAprobar = async () => {
    if (!cotizacionId || isUpdating) return;

    const confirmed = await showConfirm(
      '¿Aprobar cotización?',
      `¿Deseas marcar la cotización "${cot?.codigo_cotizacion || ''}" como Aprobada?`,
      'Sí, aprobar'
    );
    if (!confirmed) return;

    setIsUpdating(true);
    setActionType('Aprobada');
    try {
      const { error } = await supabase
        .from('cotizaciones')
        .update({
          estado: 'Aprobada',
          fecha_actualizacion: new Date().toISOString(),
        })
        .eq('id', cotizacionId);

      if (error) {
        console.error('Error al aprobar cotización:', error);
        showToast(`Error al aprobar: ${error.message}`, 'error');
        return;
      }

      showToast('Cotización aprobada correctamente.', 'success');
      await queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
      await queryClient.invalidateQueries({ queryKey: ['cotizacion', cotizacionId] });
    } catch (err: any) {
      console.error('Error inesperado al aprobar cotización:', err);
      showToast(err.message || 'Error inesperado al aprobar cotización', 'error');
    } finally {
      setIsUpdating(false);
      setActionType(null);
    }
  };

  const handleRechazar = async () => {
    if (!cotizacionId || isUpdating) return;

    const confirmed = await showConfirm(
      '¿Rechazar cotización?',
      `¿Deseas marcar la cotización "${cot?.codigo_cotizacion || ''}" como Rechazada?`,
      'Sí, rechazar',
      true
    );
    if (!confirmed) return;

    setIsUpdating(true);
    setActionType('Rechazada');
    try {
      const { error } = await supabase
        .from('cotizaciones')
        .update({
          estado: 'Rechazada',
          fecha_actualizacion: new Date().toISOString(),
        })
        .eq('id', cotizacionId);

      if (error) {
        console.error('Error al rechazar cotización:', error);
        showToast(`Error al rechazar: ${error.message}`, 'error');
        return;
      }

      showToast('Cotización rechazada correctamente.', 'success');
      await queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
      await queryClient.invalidateQueries({ queryKey: ['cotizacion', cotizacionId] });
    } catch (err: any) {
      console.error('Error inesperado al rechazar cotización:', err);
      showToast(err.message || 'Error inesperado al rechazar cotización', 'error');
    } finally {
      setIsUpdating(false);
      setActionType(null);
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'aprobada':
        return (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              background: 'rgba(34, 197, 94, 0.12)',
              color: '#16a34a',
            }}
          >
            Aprobada
          </span>
        );
      case 'rechazada':
        return (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#dc2626',
            }}
          >
            Rechazada
          </span>
        );
      case 'pendiente':
        return (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#d97706',
            }}
          >
            Pendiente
          </span>
        );
      case 'anulada':
        return (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              background: 'rgba(107, 114, 128, 0.12)',
              color: '#4b5563',
            }}
          >
            Anulada
          </span>
        );
      default:
        return (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#2563eb',
            }}
          >
            {estado}
          </span>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={cot ? `Cotización: ${cot.codigo_cotizacion}` : 'Detalle de Cotización'}
      maxWidth="780px"
      padding="2rem 2.25rem"
    >
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Icons.RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <div>Cargando información segura de la cotización...</div>
        </div>
      ) : !cot ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>
          No se pudo encontrar la cotización solicitada o no se tienen los permisos necesarios.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Ficha Resumen de la Cotización */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              background: 'var(--bg-app)',
              padding: '1.25rem',
              borderRadius: '10px',
              border: '1px solid var(--border-soft)',
              fontSize: '13px',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                Cliente / Institución
              </span>
              <strong style={{ fontSize: '14px', color: '#2C221E' }}>
                {cot.clientes?.nombre_institucion || `Cliente #${cot.cliente_id}`}
              </strong>
              {cot.clientes?.contacto_persona && (
                <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {cot.clientes.contacto_persona}
                </div>
              )}
            </div>

            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                Fecha de Emisión
              </span>
              <span style={{ fontWeight: 600, color: '#2C221E' }}>
                {formatDateTimeWithSeconds(cot.fecha_emision)}
              </span>
            </div>

            {cot.fecha_actualizacion && (
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                  Última Actualización
                </span>
                <span style={{ fontWeight: 600, color: '#2C221E' }}>
                  {formatDateTimeWithSeconds(cot.fecha_actualizacion)}
                </span>
              </div>
            )}

            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                Canal y Estado
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: cot.canal_origen === 'telegram' ? 'rgba(0, 136, 204, 0.12)' : 'rgba(200, 90, 50, 0.1)',
                    color: cot.canal_origen === 'telegram' ? '#0088cc' : '#C85A32',
                  }}
                >
                  {cot.canal_origen}
                </span>
                {getStatusBadge(cot.estado)}
              </div>
            </div>
          </div>

          {/* Tabla de Insumos / Mercaderías */}
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13.5px',
                background: '#FFFFFF',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid var(--border-soft)',
              }}
            >
              <thead>
                <tr style={{ background: '#F2ECE4', color: '#2C221E', textAlign: 'left', borderBottom: '1px solid var(--border-soft)' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 700 }}>Código</th>
                  <th style={{ padding: '10px 14px', fontWeight: 700 }}>Insumo / Descripción</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700 }}>Cant.</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700 }}>Precio Aplicado</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700 }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(cot.detalle_cotizacion || []).map((det, idx) => {
                  const subtotal = (Number(det.cantidad) || 0) * (Number(det.precio_aplicado) || 0);
                  return (
                    <tr
                      key={det.id}
                      style={{
                        borderBottom: '1px solid var(--border-soft)',
                        background: idx % 2 === 0 ? '#FFFFFF' : '#FDFBF7',
                      }}
                    >
                      <td style={{ padding: '10px 14px', fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>
                        {det.mercaderias?.codigo_mercaderia || '—'}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                        {det.mercaderias?.nombre || `Mercadería #${det.mercaderia_id}`}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600 }}>
                        <span style={{ background: '#F2ECE4', padding: '2px 8px', borderRadius: '4px' }}>
                          {det.cantidad}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {formatQuetzales(det.precio_aplicado)}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#C85A32' }}>
                        {formatQuetzales(subtotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#FDFBF7', borderTop: '2px solid var(--border-soft)' }}>
                  <td colSpan={4} style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, fontSize: '14px' }}>
                    Total Cotizado:
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, fontSize: '17px', color: '#C85A32' }}>
                    {formatQuetzales(cot.total_quetzales)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Barra de Acciones Inferior */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-soft)',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <button
                type="button"
                className="btn-ghost"
                onClick={onClose}
                disabled={isUpdating}
                style={{ padding: '9px 20px', fontSize: '13px', fontWeight: 600 }}
              >
                Cerrar
              </button>
            </div>

            {/* Los botones Aprobar/Rechazar se muestran ÚNICAMENTE cuando el estado es 'Pendiente' */}
            {cot.estado === 'Pendiente' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleRechazar}
                  disabled={isUpdating}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    color: '#dc2626',
                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isUpdating) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.16)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isUpdating) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                  }}
                >
                  {isUpdating && actionType === 'Rechazada' ? (
                    <Icons.RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <Icons.X size={15} />
                  )}
                  <span>Rechazar</span>
                </button>

                <button
                  type="button"
                  onClick={handleAprobar}
                  disabled={isUpdating}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: 'none',
                    background: '#16a34a',
                    color: '#FFFFFF',
                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 3px rgba(22, 163, 74, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isUpdating) e.currentTarget.style.background = '#15803d';
                  }}
                  onMouseLeave={(e) => {
                    if (!isUpdating) e.currentTarget.style.background = '#16a34a';
                  }}
                >
                  {isUpdating && actionType === 'Aprobada' ? (
                    <Icons.RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <Icons.Check size={15} />
                  )}
                  <span>Aprobar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
