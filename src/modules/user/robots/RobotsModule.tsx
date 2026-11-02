import { useNavigate } from 'react-router-dom';
import { maskPath } from '../../../routes/routeMap';
import { useAuth } from '../../../api/hooks/useAuth';
import ModuleTitle from '../../../components/ModuleTitle';
import ModuleCard from '../../../components/ui/ModuleCard';
import { Icons } from '../../../components/Icons';
import AdminButton from '../../../components/ui/AdminButton';
import Alert from '../../../components/ui/Alert';
import BackButton from '../../../components/ui/BackButton';

export default function RobotsModule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isPaid = user?.pagoValidado;
  const isOnlyAdmin = user?.rol === 'admin';

  const handleDownloadReglamento = () => {
    window.open('/docs/reglamento-guerra-robots.pdf', '_blank');
  };

  // Solo el Administrador puede ver el módulo sin pagar.
  if (!isPaid && !isOnlyAdmin) {
    return (
      <section className="dashboard-section" style={{ padding: '2rem 2.5rem' }}>
        <ModuleTitle title="Guerra de Robots" />
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Alert
            variant="warning"
            title="Acceso Restringido"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p>
                La información técnica y el reglamento oficial de la Guerra de Robots están disponibles únicamente para los usuarios que han completado y validado su proceso de inscripción.
              </p>
              <div>
                <AdminButton
                  variant="primary"
                  onClick={() => navigate(maskPath('/dashboard/pago'))}
                  icon={<Icons.CreditCard size={18} />}
                >
                  Validar mi pago ahora
                </AdminButton>
              </div>
            </div>
          </Alert>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-section" style={{ padding: '2rem 2.5rem' }}>
      <ModuleTitle title="Guerra de Robots" />

      <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '-0.5rem', marginBottom: '2rem' }}>
        Competencia de Ingeniería, Diseño y Destreza en Combate
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginTop: '2rem'
      }}>
        <ModuleCard
          title="Sobre la Competencia"
          description="Prepárate para el evento más emocionante del sistema."
        >
          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '1rem' }}>
              La <strong>Guerra de Robots 2026</strong> es el espacio donde la teoría se convierte en acción. Estudiantes de diversas sedes pondrán a prueba sus diseños en combates de estrategia y resistencia.
            </p>
            <ul style={{ paddingLeft: '1.2rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li><strong>Categorías:</strong> 1lb (Antweight) y 3lb (Beetleweight)</li>
              <li><strong>Ubicación:</strong> Hotel Alcazar Doña Victoria</li>
              <li><strong>Fecha:</strong> Durante el desarrollo del sistema (consultar agenda)</li>
            </ul>
          </div>
        </ModuleCard>

        <ModuleCard
          title="Reglamento Oficial"
          description="Asegúrate de cumplir con todas las especificaciones técnicas."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', padding: '1rem 0' }}>
            <div style={{
              background: 'var(--accent-light)',
              padding: '2rem',
              borderRadius: '50%',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px -5px rgba(var(--accent-rgb), 0.2)'
            }}>
              <Icons.Zap size={48} />
            </div>

            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '280px' }}>
              Es fundamental que descargues y leas el reglamento para evitar descalificaciones técnicas.
            </p>

            <AdminButton
              variant="success"
              onClick={handleDownloadReglamento}
              icon={<Icons.Download size={20} />}
              style={{ width: '100%', padding: '14px', borderRadius: '12px' }}
            >
              Descargar Reglamento PDF
            </AdminButton>
          </div>
        </ModuleCard>
      </div>

      <div style={{ marginTop: '2.5rem' }}>
        <ModuleCard title="Requisitos Clave de Participación">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div style={{ padding: '1.5rem', background: 'var(--bg-app)', borderRadius: '16px', border: '1px solid var(--border-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <Icons.Users size={20} color="var(--accent-primary)" />
                <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Conformación del Equipo</h4>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Equipos de 2 a 4 integrantes. Todos deben estar inscritos en el sistema.
              </p>
            </div>
            <div style={{ padding: '1.5rem', background: 'var(--bg-app)', borderRadius: '16px', border: '1px solid var(--border-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <Icons.Shield size={20} color="var(--accent-primary)" />
                <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Sistemas de Seguridad</h4>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Es obligatorio contar con un sistema de "Fail-safe" que detenga el robot si se pierde la señal.
              </p>
            </div>
            <div style={{ padding: '1.5rem', background: 'var(--bg-app)', borderRadius: '16px', border: '1px solid var(--border-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <Icons.Trophy size={20} color="var(--accent-primary)" />
                <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Criterios de Evaluación</h4>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Se evaluará agresividad, daño causado y control del robot por parte del piloto.
              </p>
            </div>
          </div>
        </ModuleCard>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', paddingBottom: '2rem' }}>
        <BackButton />
      </div>
    </section>
  );
}
