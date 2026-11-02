import { useState } from 'react';
import { maskPath } from '../../../routes/routeMap';
import { useAllUsers, useUpdateUserData, useInvalidatePayment, useAdminValidateUser, useResetDiplomaStatus, useResetUserWorkshops } from '../../../api/hooks/useUsers';
import { useAuth } from '../../../api/hooks/useAuth';
import { type UserData } from '../../../utils/auth';
import ModuleTitle from '../../../components/ModuleTitle';
import { showToast, showConfirm } from '../../../utils/swal';
import { Pagination, ITEMS_PER_PAGE } from '../../../components/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import AdminBadge from '../../../components/ui/AdminBadge';
import ModuleCard from '../../../components/ui/ModuleCard';
import AdminSelect from '../../../components/ui/AdminSelect';
import AdminTable from '../../../components/ui/AdminTable';
import { Icons } from '../../../components/Icons';
import MultiSelectFilter from '../../../components/ui/MultiSelectFilter';
import { PARTICIPANT_TYPES, getParticipantLabel } from '../../../data/userTypes';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import AdminButton from '../../../components/ui/AdminButton';
import BackButton from '../../../components/ui/BackButton';

export default function UsersModule() {
  const { data: users = [], isLoading } = useAllUsers();
  const updateUserDataMutation = useUpdateUserData();
  const invalidatePaymentMutation = useInvalidatePayment();
  const adminValidateMutation = useAdminValidateUser();
  const resetDiplomaStatusMutation = useResetDiplomaStatus();
  const resetWorkshopsMutation = useResetUserWorkshops();
  const { user: currentAdmin, isLoading: isAuthLoading } = useAuth();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<string[]>(PARTICIPANT_TYPES.map(t => t.id));
  
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [tokenLimit, setTokenLimit] = useState(0);

  const handleValidateUser = async (user: UserData) => {
    if (!user.id) return;
    try {
      await adminValidateMutation.mutateAsync({ userId: user.id, adminId: currentAdmin?.id });
      showToast(`Pago validado para ${user.nombres}`, 'success');
    } catch (error: any) { showToast(`Error al validar: ${error.message}`, 'error'); }
  };

  const handleInvalidatePayment = async (user: UserData) => {
    if (!user.id) return;
    const confirmed = await showConfirm('Anular Pago', `¿Anular pago de ${user.nombres}? El token se liberará.`, 'Sí, anular', true);
    if (confirmed) {
      const result = await invalidatePaymentMutation.mutateAsync(user.id!);
      showToast(result.message, result.success ? 'success' : 'error');
    }
  };

  const handleToggleActivation = async (user: UserData, activate: boolean) => {
    const title = activate ? 'Activar' : 'Desactivar';
    const roleName = user.rol === 'admin' ? 'Administrador' : user.rol === 'colaborador' ? 'Colaborador' : 'Participante';
    const confirmed = await showConfirm(`${title} ${roleName}`, `¿Estás seguro de ${title.toLowerCase()} a ${user.nombres}?`, title, !activate);
    if (confirmed) {
      await updateUserDataMutation.mutateAsync({ ...user, desactivado: !activate });
      showToast(`${roleName} ${activate ? 'activado' : 'desactivado'}`, 'success');
    }
  };

  const handleResetDiploma = async (user: UserData) => {
    if (!user.id) return;
    const confirmed = await showConfirm('Habilitar Edición Diploma', `¿Permitir que ${user.nombres} vuelva a editar sus datos para el diploma?`, 'Sí, habilitar', false);
    if (confirmed) {
      const result = await resetDiplomaStatusMutation.mutateAsync(user.id!);
      showToast(result.message, result.success ? 'success' : 'error');
    }
  };

  const handleResetWorkshops = async (user: UserData) => {
    if (!user.id) return;
    const confirmed = await showConfirm('Resetear Conferencias', `¿Limpiar la selección de conferencias de ${user.nombres} y permitirle elegir de nuevo?`, 'Sí, resetear', true);
    if (confirmed) {
      const result = await resetWorkshopsMutation.mutateAsync(user.id!);
      if (result.success) {
        showToast('Conferencias reseteadas correctamente', 'success');
      } else {
        showToast('Error al resetear conferencias', 'error');
      }
    }
  };

  const handleSaveTokenLimit = async () => {
    if (!selectedUser) return;
    await updateUserDataMutation.mutateAsync({ ...selectedUser, limiteTokens: tokenLimit });
    showToast('Límite de tokens actualizado', 'success');
    setIsLimitModalOpen(false);
  };

  const handleRoleChange = async (user: UserData, newRole: 'admin' | 'colaborador' | 'participante') => {
    const roleLabels = { admin: 'Administrador', colaborador: 'Colaborador', participante: 'Participante' };
    const confirmed = await showConfirm(
      `Cambiar a ${roleLabels[newRole]}`,
      `¿Confirmar cambio de rol para ${user.nombres}?`,
      'Cambiar',
      newRole !== 'admin'
    );

    if (confirmed) {
      await updateUserDataMutation.mutateAsync({ ...user, rol: newRole });
      showToast('Rol actualizado correctamente', 'success');
      if (newRole !== 'admin' && user.id === currentAdmin?.id) {
        setTimeout(() => window.location.href = maskPath('/dashboard/inicio'), 1500);
      }
    }
  };

  const filteredUsers = users.filter((u: UserData) => {
    const matchesSearch = (u.nombres + ' ' + u.apellidos).toLowerCase().includes(searchTerm.toLowerCase()) || u.correo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayment = paymentFilter === 'all' || (paymentFilter === 'paid' && u.pagoValidado && !u.desactivado) || (paymentFilter === 'pending' && !u.pagoValidado && !u.desactivado) || (paymentFilter === 'deactivated' && u.desactivado);

    // Lógica de rol exacta para tipos específicos o 'staff' (admin + colaborador)
    const matchesRole = roleFilter === 'all' || 
                       (roleFilter === 'staff' ? (u.rol === 'admin' || u.rol === 'colaborador') : u.rol === roleFilter);

    const matchesRoleVisibility = true; // El admin ve a todos

    const matchesType = typeFilter.length === PARTICIPANT_TYPES.length ? true : typeFilter.includes(u.tipoParticipante || 'externo');
    return matchesSearch && matchesPayment && matchesRole && matchesType && matchesRoleVisibility;
  });

  const paginatedUsers = filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (isAuthLoading && users.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'var(--text-secondary)' }}>
        <div className="loader-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 179, 237, 0.2)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
        <span>Cargando directorio...</span>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Opciones de rol filtradas
  const roleOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'staff', label: 'Personal (Staff)' },
    { value: 'admin', label: 'Administradores' },
    { value: 'colaborador', label: 'Colaboradores' },
    { value: 'participante', label: 'Participantes' }
  ];

  // Opciones de pago filtradas
  const paymentOptions = [
    { value: 'all', label: 'Cualquier estado' },
    { value: 'paid', label: 'Pagados' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'deactivated', label: 'Desactivados' }
  ];

  return (
    <section className="dashboard-section" style={{ padding: '0' }}>
      <div style={{ padding: '2rem 2.5rem 0' }}>
        <ModuleTitle title="Directorio Administrativo" />
      </div>

      <ModuleCard title="Participantes y Staff" description="Gestiona roles diferenciados, tipos de perfil y estados de cuenta.">
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-end',
          marginBottom: '2.5rem',
          background: 'var(--bg-app)',
          padding: '1.25rem 1.5rem',
          borderRadius: '16px',
          border: '1px solid var(--border-soft)',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <div style={{ flex: '1 1 300px' }}>
            <SearchBar value={searchTerm} onChange={(val) => { setSearchTerm(val); setPage(1); }} placeholder="Buscar por nombre o correo electrónico..." />
          </div>
          <div style={{ width: '160px' }}>
            <AdminSelect label="FILTRAR POR ROL" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} options={roleOptions} />
          </div>
          <div style={{ width: '180px' }}>
            <MultiSelectFilter label="TIPO DE PERFIL" options={PARTICIPANT_TYPES.map(t => ({ id: t.id, label: t.label }))} selectedIds={typeFilter} onChange={(ids) => { setTypeFilter(ids); setPage(1); }} />
          </div>
          <div style={{ width: '180px' }}>
            <AdminSelect label="ESTADO PAGO" value={paymentFilter} onChange={e => { setPage(1); setPaymentFilter(e.target.value); }} options={paymentOptions} />
          </div>
        </div>

        <AdminTable isLoading={isLoading || isAuthLoading} headers={["Nombre Completo", "Tipo", "Contacto", "Rol", "Pago", "Tokens", "Acciones"]} emptyMessage="No se encontraron registros con los filtros seleccionados.">
          {paginatedUsers.map(u => (
            <tr key={u.correo}>
              <td><div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{u.nombres} {u.apellidos}</div></td>
              <td><AdminBadge variant="neutral" style={{ fontSize: '11px' }}>{getParticipantLabel(u.tipoParticipante)}</AdminBadge></td>
              <td><div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}><Icons.Mail size={14} /> {u.correo}</div></td>
              <td>
                <AdminBadge variant={u.rol === 'admin' ? "purple" : u.rol === 'colaborador' ? "success" : "info"} dot={u.rol !== 'participante'}>
                  {u.rol === 'admin' ? 'Administrador' : u.rol === 'colaborador' ? 'Colaborador' : 'Participante'}
                </AdminBadge>
              </td>
              <td>{u.desactivado ? <AdminBadge variant="danger">OFF</AdminBadge> : u.pagoValidado ? <AdminBadge variant="success" dot>SÍ</AdminBadge> : <AdminBadge variant="danger" dot>NO</AdminBadge>}</td>
              <td>
                {u.rol === 'colaborador' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
                    <span style={{ fontWeight: 700, color: (u.tokensCreados || 0) >= (u.limiteTokens || 0) && (u.limiteTokens || 0) > 0 ? '#ef4444' : 'inherit' }}>
                      {u.tokensCreados || 0} / {u.limiteTokens || 0}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>tokens creados</span>
                  </div>
                ) : '-'}
              </td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  {/* Validar Pago - SOLO para Admin (No colaborador) */}
                  {/* 1. VALIDAR PAGO (Si NO está validado) */}
                  {!u.pagoValidado && !u.desactivado && (
                    <button onClick={() => handleValidateUser(u)} className="action-btn" title="Validar Pago" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Icons.CheckCircle size={18} /></button>
                  )}

                  {/* 2. ANULAR PAGO (Si YA está validado) */}
                  {u.pagoValidado && !u.desactivado && (
                    <button onClick={() => handleInvalidatePayment(u)} className="action-btn" title="Anular Pago" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Icons.AlertTriangle size={18} /></button>
                  )}

                  {/* 3. HABILITAR DIPLOMA (Solo si YA guardó datos) */}
                  {u.diplomaEditado && (
                    <button onClick={() => handleResetDiploma(u)} className="action-btn" title="Habilitar Edición Diploma" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Icons.Award size={18} /></button>
                  )}

                  {/* 4. RESETEAR TALLERES (Solo si YA tiene talleres elegidos) */}
                  {u.talleres?.some(t => t.category?.toUpperCase() !== 'GENERAL') && (
                    <button 
                      onClick={() => handleResetWorkshops(u)} 
                      className="action-btn" 
                      title="Resetear Conferencias" 
                      style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      <Icons.Calendar size={18} />
                    </button>
                  )}

                  {/* 5. LÍMITE DE TOKENS (Solo para Colaboradores) */}
                  {u.rol === 'colaborador' && (
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setTokenLimit(u.limiteTokens || 0);
                        setIsLimitModalOpen(true);
                      }}
                      className="action-btn"
                      title="Definir Límite de Tokens"
                      style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      <Icons.Zap size={18} />
                    </button>
                  )}

                  {/* 6. CAMBIAR ROL Y DESACTIVAR (Siempre visibles para el Admin) */}
                  <button
                    onClick={() => {
                      const next = u.rol === 'admin' ? 'participante' : u.rol === 'colaborador' ? 'admin' : 'colaborador';
                      handleRoleChange(u, next as any);
                    }}
                    className="action-btn"
                    title="Cambiar Rol"
                    style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <Icons.Shield size={18} />
                  </button>

                  <button 
                    onClick={() => handleToggleActivation(u, !!u.desactivado)} 
                    className="action-btn" 
                    title={u.desactivado ? "Activar" : "Desactivar"} 
                    style={{ background: u.desactivado ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)', color: u.desactivado ? '#16a34a' : '#6b7280', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    {u.desactivado ? <Icons.Plus size={18} /> : <Icons.EyeOff size={18} />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
        <Pagination current={page} total={filteredUsers.length} onPageChange={setPage} itemsPerPage={ITEMS_PER_PAGE} />
      </ModuleCard>

      <Modal isOpen={isLimitModalOpen} onClose={() => setIsLimitModalOpen(false)} title="Límite de Tokens" maxWidth="400px">
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Define cuántos tokens de activación puede generar <strong>{selectedUser?.nombres}</strong>.
        </p>
        <FormField label="CANTIDAD MÁXIMA DE TOKENS" required>
          <input
            type="number"
            className="dashboard-input"
            value={tokenLimit}
            onChange={(e) => setTokenLimit(parseInt(e.target.value) || 0)}
            min="0"
          />
        </FormField>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <AdminButton onClick={handleSaveTokenLimit} style={{ flex: 2 }}>Guardar Límite</AdminButton>
          <AdminButton variant="secondary" onClick={() => setIsLimitModalOpen(false)} style={{ flex: 1 }}>Cancelar</AdminButton>
        </div>
      </Modal>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', paddingBottom: '2rem' }}>
        <BackButton />
      </div>
    </section>
  );
}
