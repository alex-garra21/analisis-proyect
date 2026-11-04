import { useState } from 'react';
import { useAllUsers, useToggleUserStatus } from '../../../api/hooks/useUsers';
import { useAuth } from '../../../api/hooks/useAuth';
import ModuleTitle from '../../../components/ModuleTitle';
import { showToast, showConfirm } from '../../../utils/swal';
import SearchBar from '../../../components/ui/SearchBar';
import AdminBadge from '../../../components/ui/AdminBadge';
import AdminTable from '../../../components/ui/AdminTable';
import { Icons } from '../../../components/Icons';

export default function UsersModule() {
  const { data: users = [], isLoading } = useAllUsers();
  const toggleStatusMutation = useToggleUserStatus();
  const { user: currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      u.nombre.toLowerCase().includes(q) ||
      u.correo.toLowerCase().includes(q) ||
      (u.telegram_username && u.telegram_username.toLowerCase().includes(q));

    const matchesRole = roleFilter === 'all' || u.rol === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleEstado = async (targetUser: any) => {
    if (targetUser.id === currentUser?.id) {
      showToast('No puedes desactivar tu propia cuenta de sistemas', 'warning');
      return;
    }

    const accion = targetUser.estado ? 'desactivar' : 'activar';
    const confirmed = await showConfirm(
      `¿Deseas ${accion} la cuenta de ${targetUser.nombre || targetUser.correo}?`,
      `El usuario ${targetUser.estado ? 'perderá' : 'recuperará'} acceso inmediato al sistema.`
    );

    if (confirmed) {
      try {
        await toggleStatusMutation.mutateAsync({
          userId: targetUser.id,
          estado: !targetUser.estado,
        });
        showToast(`Usuario ${targetUser.estado ? 'desactivado' : 'activado'} correctamente`, 'success');
      } catch (err: any) {
        showToast(`Error: ${err.message}`, 'error');
      }
    }
  };

  const headers = [
    'Nombre',
    'Correo Electrónico',
    'Rol Asignado',
    'Telegram Username',
    'Estado',
    'Acciones',
  ];

  return (
    <div className="users-module">
      <ModuleTitle title="Gestión de Usuarios y Roles (Supabase)" />

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
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre, correo o telegram..."
            style={{ maxWidth: '360px' }}
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="dashboard-input"
            style={{ maxWidth: '200px' }}
          >
            <option value="all">Todos los roles</option>
            <option value="sistemas">Sistemas</option>
            <option value="administrador">Administrador</option>
            <option value="colaborador">Colaborador</option>
          </select>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {filteredUsers.length} usuario{filteredUsers.length === 1 ? '' : 's'} registrado{filteredUsers.length === 1 ? '' : 's'}
        </div>
      </div>

      <AdminTable
        headers={headers}
        isLoading={isLoading}
        emptyMessage="No se encontraron usuarios en la tabla public.usuarios."
      >
        {filteredUsers.map((u) => (
          <tr key={u.id}>
            <td>
              <strong style={{ color: 'var(--text-primary)' }}>{u.nombre || '—'}</strong>
            </td>
            <td style={{ color: 'var(--text-secondary)' }}>{u.correo}</td>
            <td>
              <span
                style={{
                  padding: '3px 9px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background:
                    u.rol === 'sistemas'
                      ? 'rgba(99, 102, 241, 0.15)'
                      : u.rol === 'administrador'
                      ? 'rgba(24, 95, 165, 0.12)'
                      : 'rgba(16, 185, 129, 0.12)',
                  color:
                    u.rol === 'sistemas'
                      ? '#4f46e5'
                      : u.rol === 'administrador'
                      ? '#185FA5'
                      : '#10b981',
                }}
              >
                {u.rolNombre || u.rol}
              </span>
            </td>
            <td>
              {u.telegram_username ? (
                <span style={{ color: '#0088cc', fontWeight: 600 }}>
                  @{u.telegram_username}
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Sin vincular</span>
              )}
            </td>
            <td>
              <AdminBadge variant={u.estado ? 'success' : 'danger'}>
                {u.estado ? 'Activo' : 'Inactivo'}
              </AdminBadge>
            </td>
            <td>
              <button
                type="button"
                className={`admin-btn ${u.estado ? 'admin-btn-danger' : 'admin-btn-success'}`}
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => handleToggleEstado(u)}
              >
                <Icons.Power size={14} />
                <span>{u.estado ? 'Desactivar' : 'Activar'}</span>
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
