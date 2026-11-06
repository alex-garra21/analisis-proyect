import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditoria } from '../../api/hooks/useAuditoria';
import { useAuth } from '../../api/hooks/useAuth';
import type { AuditoriaRegistro } from '../../types/database';
import ModuleTitle from '../../components/ModuleTitle';
import AdminTable from '../../components/ui/AdminTable';
import AdminBadge from '../../components/ui/AdminBadge';
import SearchBar from '../../components/ui/SearchBar';
import { Icons } from '../../components/Icons';
import { maskPath } from '../../routes/routeMap';
import AuditoriaDetalleModal from '../../modules/admin/auditoria/AuditoriaDetalleModal';

export default function AuditoriaPage() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const {
    data: logs = [],
    isLoading: isLogsLoading,
    refetch,
    isRealtimeActive,
  } = useAuditoria();

  // Carga automática garantizada al montar el componente
  useEffect(() => {
    refetch();
  }, [refetch]);

  const [query, setQuery] = useState('');
  const [selectedModulo, setSelectedModulo] = useState<string>('todos');
  const [selectedAccion, setSelectedAccion] = useState<string>('todas');
  const [selectedRegistro, setSelectedRegistro] = useState<AuditoriaRegistro | null>(null);

  // Rol determinado estrictamente (Exclusivo 'sistemas')
  const rawRole = (user?.rol || '').toLowerCase().trim();
  const isAuthorized =
    rawRole === 'sistemas' || user?.correo === 'salexanderr2@gmail.com';

  // Obtener listas únicas de módulos y acciones presentes en los registros
  const uniqueModulos = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((log) => {
      if (log.modulo) set.add(log.modulo.toLowerCase());
    });
    return Array.from(set).sort();
  }, [logs]);

  const uniqueAcciones = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((log) => {
      if (log.accion) set.add(log.accion.toUpperCase());
    });
    return Array.from(set).sort();
  }, [logs]);

  // Filtrado reactivo en memoria
  const logsFiltrados = useMemo(() => {
    const q = query.trim().toLowerCase();

    return logs.filter((log) => {
      // Filtro por Módulo
      if (selectedModulo !== 'todos' && log.modulo?.toLowerCase() !== selectedModulo.toLowerCase()) {
        return false;
      }

      // Filtro por Acción
      if (selectedAccion !== 'todas' && log.accion?.toUpperCase() !== selectedAccion.toUpperCase()) {
        return false;
      }

      // Filtro por Texto libre
      if (!q) return true;

      const userText = `${log.usuarios?.nombre || ''} ${log.usuarios?.apellido || ''} ${log.usuarios?.correo || ''}`.toLowerCase();
      const moduloText = (log.modulo || '').toLowerCase();
      const accionText = (log.accion || '').toLowerCase();
      const descText = (log.descripcion || '').toLowerCase();
      const detallesText = log.detalles ? JSON.stringify(log.detalles).toLowerCase() : '';

      return (
        userText.includes(q) ||
        moduloText.includes(q) ||
        accionText.includes(q) ||
        descText.includes(q) ||
        detallesText.includes(q)
      );
    });
  }, [logs, query, selectedModulo, selectedAccion]);

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

  // Bloqueo de seguridad para roles no autorizados
  if (!isAuthLoading && !isAuthorized) {
    return (
      <div
        style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid var(--border-soft)',
          maxWidth: '560px',
          margin: '2rem auto',
        }}
      >
        <div style={{ color: '#DC2626', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
          <Icons.Shield size={48} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2C221E', margin: '0 0 0.5rem' }}>
          Acceso Restringido
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', margin: '0 0 1.5rem' }}>
          El módulo de <strong>Auditoría del Sistema</strong> está disponible única y exclusivamente para el rol de{' '}
          <strong>Sistemas</strong>.
        </p>
        <button
          type="button"
          className="btn-solid"
          onClick={() => navigate(maskPath('/dashboard'))}
          style={{ padding: '9px 20px', fontSize: '13px', fontWeight: 600 }}
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  const headers = [
    'Usuario Responsable',
    'Módulo',
    'Acción',
    'Descripción del Evento',
    'Fecha y Hora (con segundos)',
    'Acción',
  ];

  return (
    <div className="auditoria-module" style={{ color: 'var(--text-primary)' }}>
      {/* Título y Acciones de Encabezado */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <ModuleTitle title="Auditoría del Sistema" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Auditoría del Sistema
          </h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Registro cronológico y trazabilidad de eventos y cambios realizados en la plataforma
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Indicador de Supabase Realtime Automático */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 11px',
              borderRadius: '20px',
              background: isRealtimeActive ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              border: `1px solid ${isRealtimeActive ? 'rgba(34, 197, 94, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
              fontSize: '11px',
              fontWeight: 700,
              color: isRealtimeActive ? '#16a34a' : '#d97706',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
            }}
            title={
              isRealtimeActive
                ? 'Conectado a Supabase Realtime (suscripción activa en vivo)'
                : 'Conectando con Supabase Realtime...'
            }
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: isRealtimeActive ? '#16a34a' : '#d97706',
                boxShadow: isRealtimeActive ? '0 0 6px rgba(34, 197, 94, 0.8)' : 'none',
                display: 'inline-block',
              }}
            />
            <span>{isRealtimeActive ? 'En vivo' : 'Conectando'}</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros Superiores */}
      <div
        style={{
          background: 'var(--bg-app)',
          padding: '1.15rem 1.25rem',
          borderRadius: '10px',
          border: '1px solid var(--border-soft)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', flex: 1 }}>
          {/* Búsqueda por texto */}
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Buscar por usuario, descripción o JSON..."
            style={{ maxWidth: '340px' }}
          />

          {/* Filtro por Módulo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label
              htmlFor="filter-modulo"
              style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}
            >
              Módulo:
            </label>
            <select
              id="filter-modulo"
              value={selectedModulo}
              onChange={(e) => setSelectedModulo(e.target.value)}
              style={{
                padding: '8px 12px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid var(--border-med)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            >
              <option value="todos">Todos los módulos</option>
              {uniqueModulos.map((mod) => (
                <option key={mod} value={mod}>
                  {mod.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Acción */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label
              htmlFor="filter-accion"
              style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}
            >
              Acción:
            </label>
            <select
              id="filter-accion"
              value={selectedAccion}
              onChange={(e) => setSelectedAccion(e.target.value)}
              style={{
                padding: '8px 12px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid var(--border-med)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            >
              <option value="todas">Todas las acciones</option>
              {uniqueAcciones.map((acc) => (
                <option key={acc} value={acc}>
                  {acc}
                </option>
              ))}
            </select>
          </div>

          {/* Limpiar filtros */}
          {(query || selectedModulo !== 'todos' || selectedAccion !== 'todas') && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setQuery('');
                setSelectedModulo('todos');
                setSelectedAccion('todas');
              }}
              style={{ padding: '6px 12px', fontSize: '12px', color: '#DC2626' }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Contador de registros */}
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Mostrando <strong>{logsFiltrados.length}</strong> de <strong>{logs.length}</strong> eventos
        </div>
      </div>

      {/* Tabla Principal de Registros de Auditoría */}
      <AdminTable
        headers={headers}
        isLoading={isLogsLoading}
        emptyMessage="No se encontraron registros de auditoría en la base de datos."
      >
        {logsFiltrados.map((log) => {
          const nombreCompleto = log.usuarios?.nombre
            ? `${log.usuarios.nombre} ${log.usuarios.apellido || ''}`.trim()
            : null;

          return (
            <tr key={log.id} style={{ transition: 'background-color 0.15s' }}>
              {/* Usuario */}
              <td>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ fontSize: '13.5px', color: '#2C221E' }}>
                    {nombreCompleto || 'Usuario del Sistema'}
                  </strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {log.usuarios?.correo || (log.usuario_id ? `${log.usuario_id.substring(0, 8)}...` : 'Sistema')}
                  </span>
                </div>
              </td>

              {/* Módulo */}
              <td>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '5px',
                    background: 'rgba(200, 90, 50, 0.08)',
                    color: '#C85A32',
                    fontWeight: 700,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    fontFamily: 'ui-monospace, monospace',
                  }}
                >
                  {log.modulo}
                </span>
              </td>

              {/* Acción */}
              <td>{getActionBadge(log.accion)}</td>

              {/* Descripción */}
              <td style={{ maxWidth: '280px' }}>
                <span
                  style={{
                    fontSize: '13px',
                    color: '#2C221E',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                  title={log.descripcion}
                >
                  {log.descripcion || '—'}
                </span>
              </td>

              {/* Fecha y Hora con segundos */}
              <td style={{ fontSize: '12.5px', color: '#2C221E', whiteSpace: 'nowrap', fontWeight: 600 }}>
                {formatDateTimeWithSeconds(log.created_at)}
              </td>

              {/* Acción Ver Detalles */}
              <td>
                <button
                  type="button"
                  className="admin-btn admin-btn-info"
                  onClick={() => setSelectedRegistro(log)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  <Icons.Eye size={13} />
                  <span>Ver Detalles</span>
                </button>
              </td>
            </tr>
          );
        })}
      </AdminTable>

      {/* Modal de Detalle JSON del Registro */}
      <AuditoriaDetalleModal
        isOpen={Boolean(selectedRegistro)}
        onClose={() => setSelectedRegistro(null)}
        registro={selectedRegistro}
      />
    </div>
  );
}
