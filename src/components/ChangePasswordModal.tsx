import React, { useState } from 'react';
import { verifyAndChangePassword, validatePasswordStrength } from '../utils/auth';
import PasswordField from './PasswordField';
import Modal from './ui/Modal';
import { Icons } from './Icons';
import { showToast } from '../utils/swal';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearFields = () => {
    setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setIsSubmitting(false);
  };

  const handleClose = () => {
    clearFields();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwords.oldPassword) {
      showToast('Debes ingresar tu contraseña actual.', 'warning');
      return;
    }

    if (passwords.newPassword === passwords.oldPassword) {
      showToast('La nueva contraseña no puede ser igual a la actual.', 'warning');
      return;
    }

    const passwordValidation = validatePasswordStrength(passwords.newPassword);
    if (!passwordValidation.isValid) {
      showToast(passwordValidation.message, 'warning');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('Las nuevas contraseñas no coinciden.', 'warning');
      return;
    }

    setIsSubmitting(true);
    const result = await verifyAndChangePassword(passwords.oldPassword, passwords.newPassword);
    setIsSubmitting(false);

    if (result.success) {
      showToast('Contraseña actualizada correctamente', 'success');
      handleClose();
    } else {
      showToast(result.message, 'error');
    }
  };

  const currentPasswordStrength = passwords.newPassword.length > 0 ? validatePasswordStrength(passwords.newPassword) : null;
  const passwordsMatch = passwords.newPassword.length > 0 && passwords.newPassword === passwords.confirmPassword;
  const showMatchError = passwords.confirmPassword.length > 0 && !passwordsMatch;

  const requirements = [
    { id: 'length', label: 'Mínimo 6 caracteres', met: passwords.newPassword.length >= 6 },
    { id: 'uppercase', label: 'Al menos 1 letra mayúscula (A..Z)', met: /[A-Z]/.test(passwords.newPassword) },
    { id: 'lowercase', label: 'Al menos 1 letra minúscula (a..z)', met: /[a-z]/.test(passwords.newPassword) },
    { id: 'number', label: 'Al menos 1 número (0..9)', met: /[0-9]/.test(passwords.newPassword) },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="680px"
      padding="2.5rem 2.25rem"
      zIndex={10001}
    >
      <div className="pwd-modal-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* Columna Izquierda: Título y Requisitos de Seguridad */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{
            fontSize: '26px',
            fontWeight: 700,
            color: '#2C221E',
            fontFamily: 'Source Sans 3, sans-serif',
            margin: '0 0 1rem 0',
            letterSpacing: '-0.3px',
            lineHeight: 1.2
          }}>
            Cambiar contraseña
          </h2>

          <p style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#7C6E67',
            margin: '0 0 1.25rem 0',
            letterSpacing: '0.2px'
          }}>
            La contraseña debe contener:
          </p>

          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            {requirements.map((req) => {
              const isMet = req.met;
              return (
                <li
                  key={req.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: isMet ? '#16A34A' : '#7C6E67',
                    transition: 'color 0.2s ease'
                  }}
                >
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                    flexShrink: 0
                  }}>
                    <Icons.Check size={16} color={isMet ? '#16A34A' : '#C85A32'} />
                  </span>
                  <span>{req.label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Columna Derecha: 3 Campos Verticales y Botones de Acción */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Campo 1: Contraseña Actual */}
          <div style={{ marginBottom: '1rem' }}>
            <PasswordField
              label="Contraseña Actual"
              value={passwords.oldPassword}
              onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
              placeholder="••••••••"
              required
              success={passwords.oldPassword.length >= 6}
              autoComplete="current-password"
              style={{ marginBottom: 0 }}
            />
          </div>

          {/* Separador Visual entre Contraseña Actual y Nueva Contraseña */}
          <div style={{
            height: '1px',
            background: '#E6DFD5',
            margin: '0.25rem 0 1.25rem'
          }} />

          {/* Campo 2: Nueva Contraseña */}
          <div style={{ marginBottom: '1rem' }}>
            <PasswordField
              label="Nueva Contraseña"
              value={passwords.newPassword}
              onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
              placeholder="••••••••"
              required
              success={currentPasswordStrength?.isValid}
              autoComplete="new-password"
              style={{ marginBottom: 0 }}
            />
          </div>

          {/* Campo 3: Confirmar Nueva Contraseña */}
          <div style={{ marginBottom: '1.5rem' }}>
            <PasswordField
              label="Confirmar Nueva Contraseña"
              value={passwords.confirmPassword}
              onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              placeholder="••••••••"
              required
              success={passwordsMatch}
              error={showMatchError}
              autoComplete="new-password"
              style={{ marginBottom: 0 }}
            />
            {showMatchError && (
              <span style={{ fontSize: '12px', color: '#DC2626', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                Las contraseñas no coinciden.
              </span>
            )}
          </div>

          {/* Botones de Acción (SAVE y Cancelar) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: '#C85A32',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: 'none',
                transition: 'background-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#B04A25'; }}
              onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#C85A32'; }}
            >
              {isSubmitting ? 'Guardando...' : 'GUARDAR'}
            </button>

            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#7C6E67',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '6px 12px',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#2C221E')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#7C6E67')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
