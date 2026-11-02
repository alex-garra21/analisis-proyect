import React, { useState, useEffect } from 'react';
import { useRegisterUser } from '../api/hooks/useUsers';
import { validatePasswordStrength } from '../utils/auth';
import PasswordField from './PasswordField';
import { Icons } from './Icons';
import PasswordRequirements from './PasswordRequirements';
import Modal from './ui/Modal';
import FormField from './ui/FormField';
import AdminSelect from './ui/AdminSelect';
import { showToast } from '../utils/swal';
import LoadingButton from './ui/LoadingButton';
import { PARTICIPANT_TYPES, requiresAcademicInfo, CICLOS, getParticipantIdLabel, requiresCiclo, getParticipantIdMaxLength, showParticipantIdHelp } from '../data/userTypes';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const registerUserMutation = useRegisterUser();
  const [isRegistered, setIsRegistered] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    sexo: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    tipoParticipante: '',
    carnet: '',
    ciclo: ''
  });


  // Auto-detección de dominio institucional
  useEffect(() => {
    if (formData.correo.toLowerCase().endsWith('@miumg.edu.gt')) {
      if (formData.tipoParticipante !== 'alumno' && PARTICIPANT_TYPES.some(t => t.id === 'alumno')) {
        setFormData((prev: any) => ({ ...prev, tipoParticipante: 'alumno' }));
      }
    }
  }, [formData.correo]);

  const formatCarnet = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    if (digits.length > 0) {
      formatted += digits.substring(0, 4);
      if (digits.length > 4) {
        formatted += '-' + digits.substring(4, 6);
        if (digits.length > 6) {
          formatted += '-' + digits.substring(6, 12);
        }
      }
    }
    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'carnet') {
      // Aplicar formato de guiones solo si es alumno
      const formattedValue = formData.tipoParticipante === 'alumno'
        ? formatCarnet(value)
        : value.replace(/\D/g, '').substring(0, getParticipantIdMaxLength(formData.tipoParticipante));

      setFormData((prev: any) => ({ ...prev, [name]: formattedValue }));
    } else if (name === 'tipoParticipante') {
      // Al cambiar el tipo, limpiamos carnet y ciclo para evitar conflictos de formato
      setFormData((prev: any) => ({
        ...prev,
        [name]: value,
        carnet: '',
        ciclo: ''
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const clearFields = () => {
    setFormData({
      nombres: '', apellidos: '', sexo: '', correo: '', contrasena: '', confirmarContrasena: '',
      tipoParticipante: '', carnet: '', ciclo: ''
    });
    setIsRegistered(false);
  };

  const handleClose = () => {
    clearFields();
    onClose();
  };

  const handleSwitch = () => {
    clearFields();
    if (onSwitchToLogin) onSwitchToLogin();
  };

  const ALLOWED_DOMAINS = [
    'gmail.com', 'hotmail.com', 'hotmail.es', 'outlook.com', 'outlook.es',
    'yahoo.com', 'yahoo.es', 'icloud.com', 'miumg.edu.gt', 'live.com', 'live.es',
    'protonmail.com', 'me.com'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tipoParticipante) {
      showToast('Por favor seleccione un tipo de participante.', 'warning');
      return;
    }

    if (requiresAcademicInfo(formData.tipoParticipante) && !formData.carnet.trim()) {
      showToast(`Por favor ingrese su ${getParticipantIdLabel(formData.tipoParticipante).toLowerCase()}.`, 'warning');
      return;
    }

    if (requiresCiclo(formData.tipoParticipante) && !formData.ciclo) {
      showToast('Por favor seleccione su ciclo académico.', 'warning');
      return;
    }

    // Validación de dominio de correo
    const emailParts = formData.correo.toLowerCase().split('@');
    if (emailParts.length !== 2) {
      showToast('Por favor ingrese un correo electrónico válido.', 'warning');
      return;
    }

    const domain = emailParts[1];
    if (!ALLOWED_DOMAINS.includes(domain)) {
      showToast(`Solo se permiten correos de proveedores comunes (@gmail.com, @hotmail.com, @miumg.edu.gt, etc.). Si cree que su dominio debe ser incluido, contacte a soporte.`, 'warning');
      return;
    }

    // Validación de contraseñas
    const passwordValidation = validatePasswordStrength(formData.contrasena);
    if (!passwordValidation.isValid) {
      showToast(passwordValidation.message, 'warning');
      return;
    }

    if (formData.contrasena !== formData.confirmarContrasena) {
      showToast('Las contraseñas no coinciden.', 'error');
      return;
    }

    const result = await registerUserMutation.mutateAsync({
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      sexo: formData.sexo,
      correo: formData.correo,
      contrasena: formData.contrasena,
      tipoParticipante: formData.tipoParticipante,
      carnet: requiresAcademicInfo(formData.tipoParticipante) ? formData.carnet : '',
      ciclo: requiresAcademicInfo(formData.tipoParticipante) ? formData.ciclo : ''
    });

    if (result.success) {
      setIsRegistered(true);
      setFormData({
        nombres: '', apellidos: '', sexo: '', correo: '', contrasena: '', confirmarContrasena: '',
        tipoParticipante: '', carnet: '', ciclo: ''
      });
    } else {
      showToast(result.message, 'error');
    }
  };

  const passwordsMatch = formData.contrasena.length > 0 && formData.contrasena === formData.confirmarContrasena;
  const showPasswordError = formData.confirmarContrasena.length > 0 && !passwordsMatch;
  const currentPasswordStrength = formData.contrasena.length > 0 ? validatePasswordStrength(formData.contrasena) : null;


  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isRegistered ? "¡Registro Exitoso!" : "Regístrate aquí"}
      maxWidth="440px"
      zIndex={9999}
    >
      {isRegistered ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <Icons.CheckCircle size={80} color="#7ed321" strokeWidth={1.5} />
          </div>
          <p className="modal-sub" style={{ marginBottom: '2rem' }}>
            Tu cuenta ha sido creada correctamente. Ahora puedes acceder a la plataforma.
          </p>
          <LoadingButton
            onClick={() => {
              if (onSwitchToLogin) handleSwitch();
              else handleClose();
            }}
            fullWidth
          >
            Ir al inicio de sesión
          </LoadingButton>
        </div>
      ) : (
        <>
          <p className="modal-sub" style={{ marginBottom: '0.5rem' }}>Crea una cuenta para operar en el sistema</p>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '1.5rem' }}>
            Los campos marcados con <span style={{ color: '#ef4444' }}>*</span> son obligatorios.
          </p>


          <form onSubmit={handleSubmit}>
            <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
              <FormField label="Nombres" required style={{ flex: 1 }}>
                <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} placeholder="Ej. Juan Manuel" required className="dashboard-input" />
              </FormField>
              <FormField label="Apellidos" required style={{ flex: 1 }}>
                <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} placeholder="Ej. Pérez López" required className="dashboard-input" />
              </FormField>
            </div>

            <FormField label="Tipo de Participante" required>
              <AdminSelect
                name="tipoParticipante"
                value={formData.tipoParticipante}
                onChange={handleChange as any}
                options={PARTICIPANT_TYPES.map(type => ({ value: type.id, label: type.label }))}
                placeholder="Selección"
              />
            </FormField>

            {requiresAcademicInfo(formData.tipoParticipante) && (
              <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                <FormField label={getParticipantIdLabel(formData.tipoParticipante)} required style={{ flex: 2 }}>
                  <input type="text" name="carnet" value={formData.carnet} onChange={handleChange} placeholder={`Ej: ${formData.tipoParticipante === 'docente' ? '123456' : '09022412345'}`} required className="dashboard-input" />
                  {showParticipantIdHelp(formData.tipoParticipante) && (
                    <span style={{ fontSize: '12px', color: '#4b5563', display: 'block', marginTop: '4px', fontWeight: 500 }}>
                      Ingresa solo números, el sistema pondrá los guiones por ti.
                    </span>
                  )}
                </FormField>

                {requiresCiclo(formData.tipoParticipante) && (
                  <FormField label="Ciclo" required style={{ flex: 1 }}>
                    <AdminSelect
                      name="ciclo"
                      value={formData.ciclo}
                      onChange={handleChange as any}
                      options={CICLOS.map(c => ({ value: c, label: c }))}
                      placeholder="Selección"
                    />
                  </FormField>
                )}
              </div>
            )}

            <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
              <FormField label="Género" required style={{ flex: 1 }}>
                <AdminSelect
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange as any}
                  options={[
                    { value: 'M', label: 'Masculino' },
                    { value: 'F', label: 'Femenino' }
                  ]}
                  placeholder="Selección"
                />
              </FormField>
              <FormField label="Correo Electrónico" required style={{ flex: 2 }}>
                <input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="correo@ejemplo.com" required className="dashboard-input" />
              </FormField>
            </div>

            <PasswordField
              label={<>Contraseña <span style={{ color: '#ef4444' }}>*</span></>}
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder="Tu contraseña"
              required
              success={passwordsMatch}
              autoComplete="new-password"
            />

            <div style={{ marginTop: '-10px' }}>
              {formData.contrasena.length > 0 && (
                <PasswordRequirements requirements={currentPasswordStrength?.requirements || []} />
              )}
              {!formData.contrasena && (
                <div style={{ fontSize: '15px', color: '#ff0000', marginBottom: '20px', fontWeight: 500 }}>
                  Requisitos: 6 caracteres, Mayúscula, Minúscula y Número.
                </div>
              )}
            </div>

            <PasswordField
              label={<>Confirmar Contraseña <span style={{ color: '#ef4444' }}>*</span></>}
              name="confirmarContrasena"
              value={formData.confirmarContrasena}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              required
              success={passwordsMatch}
              error={showPasswordError}
              autoComplete="new-password"
              style={{ marginBottom: '1.5rem' }}
            />

            {showPasswordError && (
              <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '-12px', marginBottom: '12px', display: 'block', fontWeight: 500 }}>
                Las contraseñas no coinciden.
              </span>
            )}

            <LoadingButton
              type="submit"
              isLoading={registerUserMutation.isPending}
              loadingText="Creando cuenta..."
              fullWidth
              style={{
                marginBottom: '1rem',
                opacity: (!passwordsMatch || !formData.correo) && !registerUserMutation.isPending ? 0.6 : 1,
                cursor: (!passwordsMatch || !formData.correo) ? 'not-allowed' : 'pointer'
              }}
              disabled={!passwordsMatch || !formData.correo}
            >
              Crear Cuenta
            </LoadingButton>
          </form>

          <p className="switch-link" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            ¿Ya tienes cuenta? <span onClick={handleSwitch} style={{ cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: 700 }}>Inicia sesión aquí</span>
          </p>
        </>
      )}
    </Modal>
  );
}
