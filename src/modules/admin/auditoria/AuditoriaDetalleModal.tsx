import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import AdminBadge from '../../../components/ui/AdminBadge';
import { Icons } from '../../../components/Icons';
import type { AuditoriaRegistro } from '../../../types/database';

interface AuditoriaDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  registro: AuditoriaRegistro | null;
}

export default function AuditoriaDetalleModal({
  isOpen,
  onClose,
  registro,
}: AuditoriaDetalleModalProps) {
  const [copied, setCopied] = useState(false);

  if (!registro) return null;

  const formatDateTimeWithSeconds = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
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
      return dateStr;
    }
  };

  const getActionBadge = (accion: string) => {
    const act = (accion || '').toUpperCase();
    switch (act) {
      case 'INSERT':
      case 'CREAR':
      case 'APROBAR':
        return <AdminBadge variant="success" dot>{act}</AdminBadge>;
      case 'UPDATE':
      case 'MODIFICAR':
        return <AdminBadge variant="info" dot>{act}</AdminBadge>;
      case 'DELETE':
      case 'ELIMINAR':
      case 'RECHAZAR':
        return <AdminBadge variant="danger" dot>{act}</AdminBadge>;
      case 'LOGIN':
      case 'LOGOUT':
        return <AdminBadge variant="purple" dot>{act}</AdminBadge>;
      default:
        return <AdminBadge variant="neutral">{act}</AdminBadge>;
    }
  };

  const handleCopyJson = () => {
    if (!registro.detalles) return;
    const jsonText = JSON.stringify(registro.detalles, null, 2);
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasDetails = registro.detalles && Object.keys(registro.detalles).length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle del Evento de Auditoría"
      maxWidth="720px"
      padding="1.75rem 2rem"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Ficha Resumen de Auditoría */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
              Usuario Responsable
            </span>
            <strong style={{ fontSize: '13.5px', color: '#2C221E' }}>
              {registro.usuarios?.nombre
                ? `${registro.usuarios.nombre} ${registro.usuarios.apellido || ''}`.trim()
                : 'Usuario del Sistema'}
            </strong>
            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
              {registro.usuarios?.correo || (registro.usuario_id ? `ID: ${registro.usuario_id.substring(0, 8)}...` : 'Sistema / Anónimo')}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
              Fecha y Hora Exacta
            </span>
            <span style={{ fontWeight: 600, color: '#2C221E' }}>
              {formatDateTimeWithSeconds(registro.created_at)}
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
              Módulo Afectado
            </span>
            <span
              style={{
                display: 'inline-block',
                marginTop: '4px',
                padding: '3px 9px',
                borderRadius: '6px',
                background: 'rgba(200, 90, 50, 0.1)',
                color: '#C85A32',
                fontWeight: 700,
                fontSize: '12px',
                textTransform: 'uppercase',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              {registro.modulo}
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
              Acción Ejecutada
            </span>
            <div style={{ marginTop: '4px' }}>
              {getActionBadge(registro.accion)}
            </div>
          </div>
        </div>

        {/* Descripción del Evento */}
        <div
          style={{
            background: '#FFFFFF',
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            border: '1px solid var(--border-soft)',
          }}
        >
          <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
            Descripción de la Operación
          </span>
          <p style={{ margin: 0, fontSize: '14px', color: '#2C221E', lineHeight: '1.4' }}>
            {registro.descripcion || 'Sin descripción adicional.'}
          </p>
        </div>

        {/* Carga Útil / JSON de Detalles */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <span style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
              Detalles del Registro (JSON)
            </span>

            {hasDetails && (
              <button
                type="button"
                onClick={handleCopyJson}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'none',
                  border: 'none',
                  color: copied ? '#16a34a' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  transition: 'color 0.2s',
                }}
              >
                {copied ? <Icons.Check size={14} /> : <Icons.Clipboard size={14} />}
                <span>{copied ? '¡Copiado!' : 'Copiar JSON'}</span>
              </button>
            )}
          </div>

          {hasDetails ? (
            <pre
              style={{
                margin: 0,
                padding: '1rem',
                borderRadius: '8px',
                background: '#1F1D1B',
                color: '#E6E1DC',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '12.5px',
                lineHeight: '1.5',
                maxHeight: '260px',
                overflowY: 'auto',
                border: '1px solid #332E2B',
              }}
            >
              {JSON.stringify(registro.detalles, null, 2)}
            </pre>
          ) : (
            <div
              style={{
                padding: '1.5rem',
                textAlign: 'center',
                background: 'var(--bg-app)',
                borderRadius: '8px',
                border: '1px dashed var(--border-med)',
                color: 'var(--text-secondary)',
                fontSize: '13px',
              }}
            >
              No se adjuntaron parámetros ni datos adicionales para este evento.
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-soft)',
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'ui-monospace, monospace' }}>
            ID: {registro.id}
          </span>
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 600 }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
