import { useState, useEffect } from 'react';
import { useAuth } from '../../../api/hooks/useAuth';
import { useUpdateUser } from '../../../api/hooks/useUsers';
import ModuleTitle from '../../../components/ModuleTitle';
import { showToast } from '../../../utils/swal';
import FormField from '../../../components/ui/FormField';
import LoadingButton from '../../../components/ui/LoadingButton';
import ChangePasswordModal from '../../../components/ChangePasswordModal';

export default function ProfileModule() {
  const { user, refetchProfile } = useAuth();
  const updateUserMutation = useUpdateUser();

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setNombres(user.nombre || '');
      setApellidos(user.apellido || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!nombres.trim() || !apellidos.trim()) {
      showToast('Por favor ingresa tanto tus nombres como tus apellidos', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserMutation.mutateAsync({
        userId: user.id,
        data: {
          nombre: nombres.trim(),
          apellido: apellidos.trim(),
        },
      });
      await refetchProfile();
      showToast('Perfil actualizado correctamente', 'success');
    } catch (err: any) {
      showToast(`Error al actualizar perfil: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px' }}>
      <ModuleTitle title="Mi Perfil de Usuario" />

      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--bg-card)',
          padding: '2rem',
          borderRadius: '16px',
          border: '1px solid var(--border-soft)',
          boxShadow: 'var(--shadow-sm)',
          marginTop: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Campos separados para Nombres y Apellidos que mapean directamente a public.usuarios */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <FormField label="Nombres">
            <input
              type="text"
              className="dashboard-input"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              required
              placeholder="Ej. Steven Alexander"
            />
          </FormField>

          <FormField label="Apellidos">
            <input
              type="text"
              className="dashboard-input"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              required
              placeholder="Ej. Reyes"
            />
          </FormField>
        </div>

        <FormField label="Correo Electrónico (Asociado a Supabase Auth)">
          <input
            type="email"
            className="dashboard-input"
            value={user?.correo || ''}
            disabled
            readOnly
            style={{ backgroundColor: 'var(--bg-app)', cursor: 'not-allowed' }}
          />
        </FormField>

        <FormField label="Rol Asignado en el Sistema">
          <input
            type="text"
            className="dashboard-input"
            value={user?.rolNombre || user?.rol || 'Colaborador'}
            disabled
            readOnly
            style={{ textTransform: 'capitalize', fontWeight: 700, backgroundColor: 'var(--bg-app)', cursor: 'not-allowed' }}
          />
        </FormField>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-soft)' }}>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => setIsPasswordModalOpen(true)}
            style={{ padding: '10px 16px', fontSize: '13px' }}
          >
            Cambiar Contraseña
          </button>

          <LoadingButton
            type="submit"
            isLoading={isSaving}
            className="btn-solid"
            style={{ minWidth: '160px' }}
          >
            Guardar Cambios
          </LoadingButton>
        </div>
      </form>

      {isPasswordModalOpen && (
        <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
      )}
    </div>
  );
}
