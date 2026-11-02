

import { Icons } from '../../components/Icons';
import PublicContainer from '../../components/layout/PublicContainer';

export default function PagoPage() {
  return (
    <PublicContainer
      badge="Finanzas"
      title="Métodos de pago aceptados"
      description="Completa tu inscripción de forma segura y rápida."
    >
      <div className="payment-grid" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="robotics-rule-card" style={{ maxWidth: '600px', width: '100%' }}>
          <div className="robotics-rule-icon">
            <Icons.CreditCard size={32} />
          </div>
          
          <h4 style={{ fontSize: '24px', marginBottom: '1.5rem' }}>Efectivo — Código de pago</h4>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Obtén un código único al realizar tu pago en efectivo.
          </p>

          <div style={{ display: 'grid', gap: '1rem', textAlign: 'left', width: '100%', maxWidth: '400px' }}>
            {[
              'Realiza el pago en efectivo',
              'Recibirás un código único para la validación de tu pago',
              'Ingrésalo en tu perfil del sistema',
              'El sistema valida y activa tu inscripción al instante'
            ].map((step, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ color: 'var(--accent-primary)', display: 'flex' }}>
                  <Icons.CheckCircle size={20} />
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner de información */}
      <div className="info-banner" style={{ 
        marginTop: '3rem', 
        background: 'rgba(33, 150, 243, 0.1)', 
        border: '1px solid rgba(33, 150, 243, 0.2)',
        padding: '1.5rem',
        borderRadius: '20px',
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        maxWidth: '800px',
        margin: '3rem auto 0'
      }}>
        <div style={{ color: '#2196f3' }}>
          <Icons.Info size={24} />
        </div>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
          Tu inscripción queda <strong>pendiente</strong> hasta que el pago sea validado.
        </p>
      </div>
    </PublicContainer>
  );
}
