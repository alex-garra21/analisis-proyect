import React, { useState } from 'react';
import PasswordField from './PasswordField';
import PasswordRequirements from './PasswordRequirements';
import Modal from './ui/Modal';
import FormField from './ui/FormField';
import { showToast } from '../utils/swal';
import LoadingButton from './ui/LoadingButton';
import { validatePasswordStrength } from '../utils/auth';
import { supabase } from '../utils/supabase';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordValidation = validatePasswordStrength(contrasena);

  const clearFields = () => {
    setNombre('');
    setCorreo('');
    setTelegramUsername('');
    setContrasena('');
    setConfirmarContrasena('');
  };

  const handleClose = () => {
    clearFields();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValidation.isValid) {
      showToast('Por favor cumple con todos los requisitos de la contraseña', 'warning');
      return;
    }

    if (contrasena !== confirmarContrasena) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Registro en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: correo.trim().toLowerCase(),
        password: contrasena,
        options: {
          data: {
            nombre: nombre.trim(),
            telegram_username: telegramUsername.trim() || null,
          },
        },
      });

      if (authError) throw authError;

      // 2. Inserción en la tabla public.usuarios si no hay trigger automático
      if (authData.user) {
        await supabase.from('usuarios').upsert({
          id: authData.user.id,
          nombre: nombre.trim(),
          correo: correo.trim().toLowerCase(),
          telegram_username: telegramUsername.trim() || null,
          rol_id: 3, // colaborador por defecto
          estado: true,
        });
      }

      showToast('Registro completado exitosamente. Ya puedes iniciar sesión.', 'success');
      handleClose();
      if (onSwitchToLogin) onSwitchToLogin();
    } catch (err: any) {
      showToast(err.message || 'Error al registrar usuario', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Registro de Colaborador" maxWidth="460px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FormField label="Nombre Completo">
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Juan Pérez"
            className="dashboard-input"
          />
        </FormField>

        <FormField label="Correo Electrónico">
          <input
            type="email"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="tu_correo@floresdelcampo.com"
            className="dashboard-input"
          />
        </FormField>

        <FormField label="Usuario de Telegram (opcional)">
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              @
            </span>
            <input
              type="text"
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value.replace(/^@/, ''))}
              placeholder="nombre_usuario"
              className="dashboard-input"
              style={{ paddingLeft: '28px' }}
            />
          </div>
        </FormField>

        <FormField label="Contraseña">
          <PasswordField
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            placeholder="Crea una contraseña segura"
            required
          />
        </FormField>

        {contrasena.length > 0 && (
          <PasswordRequirements requirements={passwordValidation.requirements} />
        )}

        <FormField label="Confirmar Contraseña">
          <PasswordField
            value={confirmarContrasena}
            onChange={(e) => setConfirmarContrasena(e.target.value)}
            placeholder="Repite la contraseña"
            required
          />
        </FormField>

        <div style={{ marginTop: '0.5rem' }}>
          <LoadingButton type="submit" isLoading={isLoading} className="btn-solid" style={{ width: '100%' }}>
            Crear Cuenta de Colaborador
          </LoadingButton>
        </div>

        {onSwitchToLogin && (
          <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            ¿Ya tienes una cuenta?{' '}
            <button
              type="button"
              onClick={() => {
                handleClose();
                onSwitchToLogin();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#185FA5',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Inicia sesión
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
}
