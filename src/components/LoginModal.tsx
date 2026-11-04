import React, { useState } from 'react';
import { maskPath } from '../routes/routeMap';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordModal from './ForgotPasswordModal';
import PasswordField from './PasswordField';
import Modal from './ui/Modal';
import FormField from './ui/FormField';
import { showToast } from '../utils/swal';
import LoadingButton from './ui/LoadingButton';
import { loginUser } from '../utils/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const clearFields = () => {
    setCorreo('');
    setContrasena('');
  };

  const handleClose = () => {
    clearFields();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await loginUser(correo, contrasena);
    setIsLoading(false);

    if (result.success) {
      clearFields();
      onClose();
      showToast('Sesión iniciada con éxito', 'success');
      navigate(maskPath('/dashboard/inicio'));
    } else {
      showToast(result.error || 'Credenciales incorrectas', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Iniciar Sesión" maxWidth="420px">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormField label="Correo Electrónico">
            <input
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="ejemplo@floresdelcampo.com"
              className="dashboard-input"
            />
          </FormField>

          <FormField label="Contraseña">
            <PasswordField
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Tu contraseña"
              required
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setIsForgotOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#C85A32',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <LoadingButton type="submit" isLoading={isLoading} className="btn-solid" style={{ width: '100%' }}>
              Ingresar al Sistema
            </LoadingButton>
          </div>
        </form>
      </Modal>

      {isForgotOpen && (
        <ForgotPasswordModal
          onClose={() => setIsForgotOpen(false)}
        />
      )}
    </>
  );
}
