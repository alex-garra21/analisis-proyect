import { useState } from 'react';
import { useAuth } from '../../../api/hooks/useAuth';
import { updateUserDataMutation } from '../../../api/supabase/users/userMutations';
import type { UserData } from '../../../utils/auth';
import ModuleTitle from '../../../components/ModuleTitle';
import diplomaTemplate from '../../../assets/diploma-template.png';
import { showToast } from '../../../utils/swal';
import { Icons } from '../../../components/Icons';
import Modal from '../../../components/ui/Modal';
import Alert from '../../../components/ui/Alert';
import FormField from '../../../components/ui/FormField';
import LoadingButton from '../../../components/ui/LoadingButton';
import BackButton from '../../../components/ui/BackButton';
import { getDiplomaSuggestedName } from '../../../utils/stringUtils';

type DiplomaFormData = {
  nombreDiploma: string;
  correoDiploma: string;
};

function getSuggestedDiplomaName(user: Pick<UserData, 'nombres' | 'apellidos'>): string {
  return getDiplomaSuggestedName(user.nombres, user.apellidos);
}

function buildDiplomaFormDataFromUser(user: UserData): DiplomaFormData {
  const suggestedName = getSuggestedDiplomaName(user);
  return {
    nombreDiploma: user.nombreDiploma || suggestedName,
    correoDiploma: user.correoDiploma || user.correo || '',
  };
}

function getLimpiarFormData(user: UserData): DiplomaFormData {
  return {
    nombreDiploma: getSuggestedDiplomaName(user),
    correoDiploma: user.correo || '',
  };
}

/** Reinicializa el formulario cuando cambian datos del perfil que afectan los valores iniciales. */
function diplomaFormStateKey(user: UserData): string {
  return [
    user.id,
    user.nombres,
    user.apellidos,
    user.nombreDiploma ?? '',
    user.correoDiploma ?? '',
    user.correo ?? '',
  ].join('|');
}

interface DiplomaFormSectionProps {
  user: UserData;
  refetchProfile: () => void;
  onSaveSuccess: () => void;
}

function DiplomaFormSection({ user, refetchProfile, onSaveSuccess }: DiplomaFormSectionProps) {
  const [formData, setFormData] = useState(() => buildDiplomaFormDataFromUser(user));
  const [isSaving, setIsSaving] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑÜ \-.]/g, '');
    setFormData(prev => ({ ...prev, nombreDiploma: value.substring(0, 25) }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setFormData(prev => ({ ...prev, correoDiploma: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user.diplomaEditado) return;
    setIsSaving(true);

    const updatedUser: UserData = {
      ...user,
      nombreDiploma: formData.nombreDiploma.trim().toUpperCase(),
      correoDiploma: formData.correoDiploma.trim().toLowerCase(),
      diplomaEditado: true,
    };

    const result = await updateUserDataMutation(updatedUser);
    if (result.success) {
      onSaveSuccess();
      refetchProfile();
    } else {
      showToast(result.error?.message || 'Error al guardar los datos', 'error');
    }
    setIsSaving(false);
  };

  const isDiplomaNameTooLong = formData.nombreDiploma.length > 25;
  const isLocked = user.diplomaEditado || false;
  const isPaid = user.pagoValidado || false;

  return (
    <form onSubmit={handleSave} className="diploma-form" style={{ opacity: !isPaid ? 0.6 : 1 }}>
      <div className="diploma-fields">
        <FormField
          label="Nombre para el diploma"
          required
          error={isDiplomaNameTooLong ? 'El nombre es demasiado largo (máximo 25 caracteres).' : undefined}
        >
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={formData.nombreDiploma}
              onChange={handleNameChange}
              placeholder="EJ: MARÍA GARCÍA"
              required
              readOnly={isLocked || !isPaid}
              className="dashboard-input"
              style={{
                borderColor: isDiplomaNameTooLong ? 'var(--status-error)' : undefined,
                backgroundColor: (isLocked || !isPaid) ? 'var(--bg-app)' : 'var(--bg-input)',
                color: (isLocked || !isPaid) ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: (isLocked || !isPaid) ? 'not-allowed' : 'text',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <span style={{ fontSize: '12px', color: isDiplomaNameTooLong ? 'var(--status-error)' : 'var(--text-muted)' }}>
                {formData.nombreDiploma.length} / 25 caracteres
              </span>
            </div>
          </div>
        </FormField>

        <FormField
          label="Correo para recibir el diploma"
          required
          description="Se enviará un diploma por cada conferencia donde se confirme tu asistencia."
        >
          <input
            type="email"
            value={formData.correoDiploma}
            onChange={handleEmailChange}
            placeholder="ejemplo@correo.com"
            required
            readOnly={isLocked || !isPaid}
            className="dashboard-input"
            style={{
              backgroundColor: (isLocked || !isPaid) ? 'var(--bg-app)' : 'var(--bg-input)',
              color: (isLocked || !isPaid) ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: (isLocked || !isPaid) ? 'not-allowed' : 'text',
            }}
          />
        </FormField>

        <Alert variant="warning" title="Verifica bien tus datos">
          Una vez emitido el diploma, el nombre <strong>no podrá modificarse</strong>. Asegúrate de que esté escrito correctamente y con las tildes correspondientes.
        </Alert>
      </div>

      <div className="diploma-preview-container">
        <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
          ASÍ APARECERÁ EN TU DIPLOMA
        </label>
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1.414',
            backgroundColor: 'var(--bg-app)',
            borderRadius: '12px',
            border: '1.5px solid var(--border-soft)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <img src={diplomaTemplate} alt="Template de Diploma" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />

          <div
            style={{
              position: 'absolute',
              top: '42%',
              width: '80%',
              textAlign: 'center',
              fontSize: 'clamp(8px, 1.8vw, 24px)',
              fontFamily: 'Source Sans 3, sans-serif',
              fontWeight: 800,
              color: '#1a365d',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {formData.nombreDiploma || 'TU NOMBRE AQUÍ'}
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              fontSize: '9px',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            Previsualización Ilustrativa
          </div>
        </div>
        <p
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            marginTop: '12px',
            textAlign: 'center',
            fontStyle: 'italic',
            maxWidth: '400px',
            margin: '12px auto 0',
          }}
        >
          * Esta imagen es puramente ilustrativa y no representa el diseño final del diploma oficial.
        </p>
      </div>

      {!isLocked ? (
        <div className="diploma-actions-grid">
          <LoadingButton
            type="submit"
            isLoading={isSaving}
            loadingText="Guardando..."
            style={{
              width: 'auto',
              padding: '12px 32px',
              opacity: (isDiplomaNameTooLong || !isPaid) && !isSaving ? 0.6 : 1,
              cursor: (isDiplomaNameTooLong || !isPaid) ? 'not-allowed' : 'pointer',
            }}
            disabled={isDiplomaNameTooLong || !isPaid}
          >
            Guardar datos
          </LoadingButton>
          <button
            type="button"
            className="btn-ghost"
            disabled={!isPaid}
            style={{
              width: 'auto',
              padding: '12px 24px',
              border: '1.5px solid var(--border-soft)',
              color: 'var(--text-secondary)',
              borderRadius: '12px',
              opacity: !isPaid ? 0.6 : 1,
              cursor: !isPaid ? 'not-allowed' : 'pointer',
              background: 'transparent',
            }}
            onClick={() => setFormData(getLimpiarFormData(user))}
          >
            Limpiar
          </button>
        </div>
      ) : (
        <div className="diploma-actions-grid">
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              color: '#10b981',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '14px',
              width: '100%',
            }}
          >
            Los datos han sido guardados y bloqueados. No se permiten más modificaciones.
          </div>
        </div>
      )}
    </form>
  );
}

export default function DiplomaModule() {
  const { user, refetchProfile } = useAuth();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  if (!user) return null;

  const isLocked = user.diplomaEditado || false;
  const isPaid = user.pagoValidado || false;

  return (
    <div className="diploma-module">
      <ModuleTitle title="Datos para diploma" />

      <section className="dashboard-section diploma-container">
        {!isPaid ? (
          <Alert variant="warning" title="PAGO PENDIENTE">
            Debes validar tu pago para poder confirmar los datos de tu diploma. Una vez validado, podrás ingresar tu nombre y correo para la emisión de tus certificados.
          </Alert>
        ) : (
          !isLocked && (
            <Alert variant="error" title="ATENCIÓN">
              IMPORTANTE: Solo puedes modificar estos datos UNA VEZ. Una vez guardados, los campos se bloquearán permanentemente.
            </Alert>
          )
        )}

        <Alert variant="warning" title="¿Cuándo recibirás tu diploma?" icon={<Icons.Award size={20} />}>
          <p>
            El diploma se generará y enviará posteriormente por cada conferencia en la que cumplas <strong>los tres requisitos</strong>:
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.2rem', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>Estar inscrito al Comercial Flores del Campo con pago validado</li>
            <li>Haber seleccionado la conferencia específica en tu agenda</li>
            <li>Haber confirmado tu asistencia escaneando el QR durante la conferencia</li>
          </ul>
        </Alert>

        <DiplomaFormSection
          key={diplomaFormStateKey(user)}
          user={user}
          refetchProfile={refetchProfile}
          onSaveSuccess={() => setIsSuccessModalOpen(true)}
        />
      </section>

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="¡Datos bloqueados!"
        maxWidth="400px"
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <Icons.CheckCircle size={64} color="#7ed321" />
          </div>
          <p className="modal-sub" style={{ marginBottom: '1.5rem' }}>
            Tus datos para diplomas han sido guardados y no podrán ser editados nuevamente.
          </p>
          <button className="submit-btn" onClick={() => setIsSuccessModalOpen(false)}>
            Entendido
          </button>
        </div>
      </Modal>

      <BackButton />
    </div>
  );
}
