import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useUnidadesMedida,
  useDeleteUnidadMedida,
  useToggleUnidadMedidaStatus,
  useMercaderias,
} from '../../../api/hooks/useComercial';
import { useAuth } from '../../../api/hooks/useAuth';
import type { UnidadMedida } from '../../../types/database';
import ModuleTitle from '../../../components/ModuleTitle';
import AdminTable from '../../../components/ui/AdminTable';
import AdminBadge from '../../../components/ui/AdminBadge';
import SearchBar from '../../../components/ui/SearchBar';
import { Icons } from '../../../components/Icons';
import { showToast, showConfirm } from '../../../utils/swal';
import { maskPath } from '../../../routes/routeMap';
import UnidadMedidaFormModal from './UnidadMedidaFormModal';

export default function UnidadesMedidaModule() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: unidades = [], isLoading } = useUnidadesMedida();
  const { data: mercaderias = [] } = useMercaderias();
  const deleteMutation = useDeleteUnidadMedida();
  const toggleMutation = useToggleUnidadMedidaStatus();

  const [query, setQuery] = useState('');
  const [selectedUnidad, setSelectedUnidad] = useState<UnidadMedida | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Verificación estricta de rol (Sistemas y Administrador exclusivamente)
  const rawRole = (user?.rol || '').toLowerCase().trim();
  const isAuthorized =
    rawRole === 'sistemas' || rawRole === 'administrador' || user?.correo === 'salexanderr2@gmail.com';

  // Contar cuántas mercaderías usan cada unidad de medida
  const countPorUnidad = useMemo(() => {
    const counts: Record<number, number> = {};
    mercaderias.forEach((m) => {
      if (m.unidad_medida_id) {
        const uid = Number(m.unidad_medida_id);
        counts[uid] = (counts[uid] || 0) + 1;
      }
    });
    return counts;
  }, [mercaderias]);

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return unidades;
    return unidades.filter(
      (u) =>
        u.nombre.toLowerCase().includes(q) ||
        (u.abreviatura && u.abreviatura.toLowerCase().includes(q))
    );
  }, [unidades, query]);

  const handleOpenCreate = () => {
    setSelectedUnidad(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: UnidadMedida) => {
    setSelectedUnidad(u);
    setIsModalOpen(true);
  };

  const handleToggleEstado = async (u: UnidadMedida) => {
    const nuevoEstado = !u.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';

    const confirmed = await showConfirm(
      `¿Deseas ${accion} la unidad "${u.nombre}"?`,
      nuevoEstado
        ? 'La unidad volverá a estar disponible para cotizaciones y catálogo.'
        : 'La unidad no podrá ser seleccionada en nuevos productos.'
    );

    if (confirmed) {
      try {
        await toggleMutation.mutateAsync({ id: Number(u.id), activo: nuevoEstado });
        showToast(`Unidad "${u.nombre}" ${nuevoEstado ? 'activada' : 'desactivada'} correctamente.`, 'success');
      } catch (err: any) {
        showToast(`Error al cambiar estado: ${err.message}`, 'error');
      }
    }
  };

  const handleDelete = async (u: UnidadMedida) => {
    const count = countPorUnidad[Number(u.id)] || 0;
    if (count > 0) {
      showToast(
        `No se puede eliminar "${u.nombre}" porque está asignada a ${count} mercadería(s). Puedes desactivarla en su lugar.`,
        'warning'
      );
      return;
    }

    const confirmed = await showConfirm(
      `¿Deseas eliminar permanentemente la unidad "${u.nombre}"?`,
      'Esta acción no se puede deshacer.'
    );

    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(Number(u.id));
        showToast('Unidad de medida eliminada correctamente.', 'success');
      } catch (err: any) {
        showToast(`Error al eliminar: ${err.message}`, 'error');
      }
    }
  };

  // Bloqueo de seguridad RBAC
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
          El módulo de <strong>Gestión de Unidades de Medida</strong> está disponible exclusivamente para los roles de{' '}
          <strong>Sistemas</strong> y <strong>Administrador</strong>.
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
    'ID',
    'Nombre de la Unidad',
    'Abreviatura',
    'Mercaderías Asociadas',
    'Estado',
    'Acciones',
  ];

  return (
    <div className="unidades-medida-module">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <ModuleTitle title="Gestión de Unidades de Medida" />

        <button
          type="button"
          className="btn-solid"
          onClick={handleOpenCreate}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: 'none',
          }}
        >
          <Icons.Plus size={16} />
          <span>Nueva Unidad</span>
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '1.5rem 0',
        }}
      >
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Buscar unidad por nombre o abreviatura..."
          style={{ maxWidth: '380px' }}
        />

        <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          Total registradas: <strong>{unidades.length}</strong> unidad(es)
        </div>
      </div>

      <AdminTable
        headers={headers}
        isLoading={isLoading}
        emptyMessage="No se encontraron unidades de medida registradas."
      >
        {filtradas.map((u) => {
          const associatedCount = countPorUnidad[Number(u.id)] || 0;

          return (
            <tr key={u.id}>
              <td style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--text-secondary)' }}>
                #{u.id}
              </td>
              <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {u.nombre}
              </td>
              <td>
                {u.abreviatura ? (
                  <span
                    style={{
                      fontFamily: 'ui-monospace, monospace',
                      background: 'rgba(200, 90, 50, 0.08)',
                      color: '#C85A32',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {u.abreviatura}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                )}
              </td>
              <td>
                <span
                  style={{
                    background: associatedCount > 0 ? '#F2ECE4' : 'var(--bg-app)',
                    color: associatedCount > 0 ? '#2C221E' : 'var(--text-muted)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {associatedCount} producto(s)
                </span>
              </td>
              <td>
                {u.activo ? (
                  <AdminBadge variant="success" dot>Activo</AdminBadge>
                ) : (
                  <AdminBadge variant="neutral">Inactivo</AdminBadge>
                )}
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-info"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => handleOpenEdit(u)}
                    title="Editar unidad de medida"
                  >
                    <Icons.Edit size={14} />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    className={`admin-btn ${u.activo ? 'admin-btn-warning' : 'admin-btn-success'}`}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: u.activo ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                      color: u.activo ? '#d97706' : '#16a34a',
                      border: `1px solid ${u.activo ? 'rgba(245, 158, 11, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                    }}
                    onClick={() => handleToggleEstado(u)}
                    title={u.activo ? 'Desactivar unidad' : 'Activar unidad'}
                  >
                    <Icons.Power size={14} />
                    <span>{u.activo ? 'Desactivar' : 'Activar'}</span>
                  </button>

                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => handleDelete(u)}
                    title="Eliminar unidad de medida"
                  >
                    <Icons.Trash size={14} />
                    <span>Eliminar</span>
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </AdminTable>

      <UnidadMedidaFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUnidad(null);
        }}
        unidadToEdit={selectedUnidad}
      />
    </div>
  );
}
