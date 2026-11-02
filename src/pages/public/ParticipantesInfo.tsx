import { Icons } from '../../components/Icons';
import PublicContainer from '../../components/layout/PublicContainer';

export default function ParticipantesInfo() {

  return (
    <PublicContainer
      title="Únete a los 500+ Participantes"
      description="Sé parte de la red de estudiantes y profesionales más grande de la región."
    >
      {/* Sección Guerra de Robots */}
      <div className="robotics-section">
        <div className="robotics-content">
          <div style={{ 
            marginBottom: '1.5rem', 
            display: 'flex', 
            justifyContent: 'center',
            color: 'var(--accent-primary)',
            filter: 'drop-shadow(0 0 20px rgba(25, 118, 210, 0.2))'
          }}>
            <Icons.Bot size={80} strokeWidth={1.5} />
          </div>
          <span className="robotics-badge">
            COMPETENCIA MAGNA
          </span>
          <h2 className="robotics-title">
            GUERRA DE <span>ROBOTS</span> 2026
          </h2>
          <p className="robotics-description">
            ¡Prepárate para la batalla de ingenio más emocionante! Bajo el lema <strong>"¡Pincha el Globo!"</strong>, el Comercial Flores del Campo desafía tu capacidad de diseño y programación. Aquí no solo importa la fuerza; la precisión y la estrategia en tiempo real decidirán quién sobrevive.
          </p>

          <div className="robotics-rules-grid">
            <div className="robotics-rule-card">
              <div className="robotics-rule-icon">
                <Icons.Layout size={32} />
              </div>
              <h4>Corazón Tecnológico</h4>
              <p>Robots controlados exclusivamente por <strong>ESP32</strong> mediante el protocolo <strong>ESPNOW</strong>. Se premia la construcción artesanal e impresión 3D.</p>
            </div>

            <div className="robotics-rule-card">
              <div className="robotics-rule-icon">
                <Icons.Users size={32} />
              </div>
              <h4>Formato de Combate</h4>
              <p>Enfrentamientos dinámicos de <strong>3 contra 3</strong> en un ring de 3x3m. Rondas de máxima intensidad con duración de 1 minuto.</p>
            </div>

            <div className="robotics-rule-card">
              <div className="robotics-rule-icon">
                <Icons.Shield size={32} />
              </div>
              <h4>Armamento y Defensa</h4>
              <p>Uso de hasta 3 agujas capoteras para reventar el globo rival. Prohibido el uso de fuego, proyectiles o mecanismos químicos.</p>
            </div>

            <div className="robotics-rule-card">
              <div className="robotics-rule-icon">
                <Icons.Award size={32} />
              </div>
              <h4>Criterios de Evaluación</h4>
              <p>Efectividad (50%), Diseño (20%), Innovación (20%) y Trabajo en equipo (10%).</p>
            </div>
          </div>

          <div className="robotics-footer-note">
            <Icons.Info size={20} />
            <p>
              Para obtener las bases completas y el formulario técnico, <strong onClick={() => window.dispatchEvent(new Event('openRegisterModal'))}>crea tu cuenta</strong> y descárgalas directamente desde tu perfil.
            </p>
          </div>
        </div>
      </div>

      <div className="community-benefits-grid">
        <div className="community-benefit-card">
          <div className="benefit-icon-wrapper">
            <Icons.Zap size={32} />
          </div>
          <h3>Networking Real</h3>
          <p>
            Conecta con más de 500 apasionados por la tecnología, intercambia ideas y crea alianzas estratégicas para tu futuro profesional en un ambiente vibrante.
          </p>
        </div>

        <div className="community-benefit-card">
          <div className="benefit-icon-wrapper">
            <Icons.Globe size={32} />
          </div>
          <h3>Ambiente Universitario</h3>
          <p>
            Vive la experiencia UMG en todo su esplendor, compartiendo con estudiantes de diversas sedes en un ecosistema de aprendizaje y sana convivencia.
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <h3 style={{ marginBottom: '2rem' }}>¿Qué esperas para ser parte de esto?</h3>
        <div className="hero-ctas" style={{ justifyContent: 'center' }}>
          <button
            className="btn-solid"
            onClick={() => window.dispatchEvent(new Event('openRegisterModal'))}
            style={{ padding: '16px 40px', fontSize: '16px', borderRadius: '14px' }}
          >
            Inscribirme ahora
          </button>
        </div>
      </div>
    </PublicContainer>
  );
}
