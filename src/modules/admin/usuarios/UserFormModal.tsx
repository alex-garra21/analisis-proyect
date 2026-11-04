import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import AutocompleteSelect from '../../../components/ui/AutocompleteSelect';
import PasswordField from '../../../components/PasswordField';
import { useRoles, useCreateUserAdmin, useUpdateUser } from '../../../api/hooks/useUsers';
import { showToast } from '../../../utils/swal';
import { validatePasswordStrength } from '../../../utils/auth';
import type { UserData } from '../../../utils/auth';
import PasswordRequirements from '../../../components/PasswordRequirements';
import { Icons } from '../../../components/Icons';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: UserData | null;
}

export default function UserFormModal({ isOpen, onClose, userToEdit }: UserFormModalProps) {
  const isEditing = Boolean(userToEdit);
  const { data: roles = [], isLoading: isLoadingRoles } = useRoles();
  const createMutation = useCreateUserAdmin();
  const updateMutation = useUpdateUser();

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [passwordTemporal, setPasswordTemporal] = useState('');
  const [rolId, setRolId] = useState<number>(3); // Default a Colaborador
  const [telegramUsername, setTelegramUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setNombres(userToEdit.nombre || '');
      setApellidos(userToEdit.apellido || '');
      setCorreo(userToEdit.correo || '');
      setPasswordTemporal('');
      setRolId(userToEdit.rol_id || 3);
      setTelegramUsername(userToEdit.telegram_username ? userToEdit.telegram_username.replace(/^@/, '') : '');
    } else {
      setNombres('');
      setApellidos('');
      setCorreo('');
      setPasswordTemporal('');
      // Seleccionar colaborador por defecto o el primer rol
      const defaultRole = roles.find(r => r.nombre === 'colaborador') || roles[0];
      setRolId(defaultRole ? defaultRole.id : 3);
      setTelegramUsername('');
    }
  }, [userToEdit, isOpen, roles]);

  const passwordValidation = !isEditing && passwordTemporal.length > 0 
    ? validatePasswordStrength(passwordTemporal) 
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombres.trim() || !apellidos.trim()) {
      showToast('Debes ingresar nombres y apellidos completos.', 'warning');
      return;
    }

    if (!isEditing) {
      if (!correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
        showToast('Ingresa un correo electrónico válido.', 'warning');
        return;
      }

      if (!passwordTemporal) {
        showToast('Debes asignar una contraseña temporal para el nuevo usuario.', 'warning');
        return;
      }

      const val = validatePasswordStrength(passwordTemporal);
      if (!val.isValid) {
        showToast(val.message, 'warning');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (isEditing && userToEdit) {
        // Modo Edición
        const res = await updateMutation.mutateAsync({
          userId: userToEdit.id,
          data: {
            nombre: nombres.trim(),
            apellido: apellidos.trim(),
            rol_id: Number(rolId),
            telegram_username: telegramUsername.trim() ? telegramUsername.replace(/^@/, '').trim() : null,
          }
        });

        if (res.error) {
          showToast(`Error al actualizar usuario: ${res.error.message || res.error}`, 'error');
        } else {
          showToast('Usuario actualizado correctamente', 'success');
          onClose();
        }
      } else {
        // Modo Creación
        const res = await createMutation.mutateAsync({
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          correo: correo.trim().toLowerCase(),
          passwordTemporal,
          rol_id: Number(rolId),
          telegram_username: telegramUsername.trim() ? telegramUsername.replace(/^@/, '').trim() : null,
        });

        if (!res.success) {
          showToast(`Error al registrar usuario: ${res.error}`, 'error');
        } else {
          showToast('Usuario creado exitosamente en Auth y base de datos', 'success');
          onClose();
        }
      }
    } catch (err: any) {
      showToast(`Ocurrió un error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
      maxWidth="580px"
      padding="2rem 2.25rem"
    >
      <p style={{ margin: '0 0 1.5rem', fontSize: '13px', color: 'var(--text-secondary)' }}>
        {isEditing
          ? 'Actualiza los datos del usuario, su rol y su vinculación con Telegram.'
          : 'Registra un nuevo usuario en Supabase Auth y asigna su rol dentro del sistema.'}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Nombres y Apellidos en dos columnas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <FormField label="Nombres">
            <input
              type="text"
              className="dashboard-input"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              placeholder="Ej. Juan Carlos"
              required
            />
          </FormField>

          <FormField label="Apellidos">
            <input
              type="text"
              className="dashboard-input"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              placeholder="Ej. Morales Pérez"
              required
            />
          </FormField>
        </div>

        {/* Correo Electrónico */}
        <FormField label="Correo Electrónico">
          <input
            type="email"
            className="dashboard-input"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="usuario@comercialflores.com"
            disabled={isEditing}
            required
            style={{
              backgroundColor: isEditing ? 'var(--bg-app)' : 'var(--bg-input)',
              cursor: isEditing ? 'not-allowed' : 'text',
            }}
          />
        </FormField>

        {/* Contraseña Temporal (solo en creación) */}
        {!isEditing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <PasswordField
              label="Contraseña Temporal"
              value={passwordTemporal}
              onChange={(e) => setPasswordTemporal(e.target.value)}
              placeholder="Min. 6 caracteres (Mayús, Min, Núm)"
              required
              success={passwordValidation?.isValid}
            />
            <PasswordRequirements
              requirements={
                passwordValidation?.requirements || validatePasswordStrength('').requirements
              }
            />
          </div>
        )}

        {/* Rol Asignado y Usuario de Telegram en dos columnas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <FormField label="Rol Asignado">
            <AutocompleteSelect
              options={roles.map((r) => ({
                value: String(r.id),
                label: r.nombre.charAt(0).toUpperCase() + r.nombre.slice(1),
              }))}
              value={String(rolId)}
              onChange={(val) => setRolId(Number(val))}
              placeholder="Buscar o seleccionar rol..."
              disabled={isLoadingRoles}
            />
          </FormField>

          {/* Campo de Telegram estilizado con Terracota */}
          <FormField label="Usuario de Telegram">
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--accent-primary)',
                  fontWeight: 800,
                  fontSize: '14px',
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
                placeholder="alias_telegram"
              />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Sin el signo @. Utilizado para cotizaciones y notificaciones.
            </span>
          </FormField>
        </div>

        {/* Botones de Acción */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-soft)',
          }}
        >
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            disabled={isSubmitting}
            style={{ padding: '10px 18px' }}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="btn-solid"
            disabled={isSubmitting}
            style={{
              padding: '10px 22px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isSubmitting ? (
              <>
                <Icons.RefreshCw size={16} className="animate-spin" />
                <span>{isEditing ? 'Actualizando...' : 'Guardando...'}</span>
              </>
            ) : (
              <>
                <Icons.Check size={16} />
                <span>{isEditing ? 'Guardar Cambios' : 'Crear Usuario'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
