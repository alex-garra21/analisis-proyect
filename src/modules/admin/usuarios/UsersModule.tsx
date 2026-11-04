import { useState } from 'react';
import { useAllUsers, useToggleUserStatus } from '../../../api/hooks/useUsers';
import { useAuth } from '../../../api/hooks/useAuth';
import type { UserData } from '../../../utils/auth';
import ModuleTitle from '../../../components/ModuleTitle';
import { showToast, showConfirm } from '../../../utils/swal';
import SearchBar from '../../../components/ui/SearchBar';
import AdminBadge from '../../../components/ui/AdminBadge';
import AdminTable from '../../../components/ui/AdminTable';
import AutocompleteSelect from '../../../components/ui/AutocompleteSelect';
import { Icons } from '../../../components/Icons';
import UserFormModal from './UserFormModal';

export default function UsersModule() {
  const { data: users = [], isLoading } = useAllUsers();
  const toggleStatusMutation = useToggleUserStatus();
  const { user: currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const isSistemasOrAdmin =
    currentUser?.rol === 'sistemas' || currentUser?.rol === 'administrador';

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const fullName = [u.nombre, u.apellido].filter(Boolean).join(' ').toLowerCase();
    const matchesSearch =
      fullName.includes(q) ||
      (u.correo && u.correo.toLowerCase().includes(q)) ||
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
        showToast(
          `Usuario ${targetUser.estado ? 'desactivado' : 'activado'} correctamente`,
          'success'
        );
      } catch (err: any) {
        showToast(`Error: ${err.message}`, 'error');
      }
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: UserData) => {
    setSelectedUser(u);
    setIsModalOpen(true);
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
        <ModuleTitle title="Gestión de Usuarios y Roles (Supabase)" />

        {isSistemasOrAdmin && (
          <button
            type="button"
            className="btn-solid"
            onClick={handleOpenCreateModal}
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
            <span>Nuevo Usuario</span>
          </button>
        )}
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
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre, correo o telegram..."
            style={{ maxWidth: '360px' }}
          />

          <AutocompleteSelect
            options={[
              { value: 'all', label: 'Todos los roles' },
              { value: 'sistemas', label: 'Sistemas' },
              { value: 'administrador', label: 'Administrador' },
              { value: 'colaborador', label: 'Colaborador' },
            ]}
            value={roleFilter}
            onChange={(val) => setRoleFilter(val)}
            style={{ width: '180px' }}
          />
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
              <strong style={{ color: 'var(--text-primary)' }}>
                {[u.nombre, u.apellido].filter(Boolean).join(' ') || '—'}
              </strong>
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
                      ? 'rgba(200, 90, 50, 0.12)'
                      : 'rgba(16, 185, 129, 0.12)',
                  color:
                    u.rol === 'sistemas'
                      ? '#4f46e5'
                      : u.rol === 'administrador'
                      ? '#C85A32'
                      : '#10b981',
                }}
              >
                {u.rolNombre || u.rol}
              </span>
            </td>
            <td>
              {u.telegram_username ? (
                <span style={{ color: '#C85A32', fontWeight: 600 }}>
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
              <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                {isSistemasOrAdmin && (
                  <button
                    type="button"
                    className="admin-btn"
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: '#F2ECE4',
                      color: '#2C221E',
                      borderColor: '#E6DFD5',
                    }}
                    onClick={() => handleOpenEditModal(u)}
                    title="Editar usuario"
                  >
                    <Icons.Edit size={14} />
                    <span>Editar</span>
                  </button>
                )}
                <button
                  type="button"
                  className={`admin-btn ${u.estado ? 'admin-btn-danger' : 'admin-btn-success'}`}
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => handleToggleEstado(u)}
                >
                  <Icons.Power size={14} />
                  <span>{u.estado ? 'Desactivar' : 'Activar'}</span>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        userToEdit={selectedUser}
      />
    </div>
  );
}
