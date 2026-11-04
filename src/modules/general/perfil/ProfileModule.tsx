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

  const [nombre, setNombre] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setTelegramUsername(user.telegram_username || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSaving(true);
    try {
      await updateUserMutation.mutateAsync({
        userId: user.id,
        data: {
          nombre: nombre.trim(),
          telegram_username: telegramUsername.trim() || null,
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
        <FormField label="Nombre Completo">
          <input
            type="text"
            className="dashboard-input"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            placeholder="Tu nombre y apellido"
          />
        </FormField>

        <FormField label="Correo Electrónico (Asociado a Supabase Auth)">
          <input
            type="email"
            className="dashboard-input"
            value={user?.correo || ''}
            disabled
            readOnly
          />
        </FormField>

        <FormField label="Rol Asignado en el Sistema">
          <input
            type="text"
            className="dashboard-input"
            value={user?.rolNombre || user?.rol || 'Colaborador'}
            disabled
            readOnly
            style={{ textTransform: 'capitalize', fontWeight: 700 }}
          />
        </FormField>

        <FormField label="Usuario de Telegram (para integración de bot y cotizaciones)">
          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                fontWeight: 700,
              }}
            >
              @
            </span>
            <input
              type="text"
              className="dashboard-input"
              style={{ paddingLeft: '28px' }}
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value.replace(/^@/, ''))}
              placeholder="usuario_telegram"
            />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Utilizado para canalizar cotizaciones y notificaciones automáticas por Telegram.
          </span>
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
