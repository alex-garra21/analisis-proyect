import { useAuth } from '../../api/hooks/useAuth';
import { Icons } from '../../components/Icons';
import congresoHero from '../../assets/background-hero.png';
import { supabase } from '../../utils/supabase';

export default function DeactivatedPage() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      position: 'relative',
      padding: '2rem',
      overflow: 'hidden'
    }}>
      {/* Fondo Premium */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${congresoHero})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.15,
        filter: 'grayscale(100%)',
        zIndex: 0
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '450px',
        background: 'var(--bg-card)',
        borderRadius: '30px',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-xl)',
        position: 'relative',
        zIndex: 10,
        border: '1px solid var(--border-soft)',
        textAlign: 'center'
      }}>
        {/* Badge de Estado */}
        <div style={{
          background: '#fee2e2',
          color: '#ef4444',
          padding: '8px 20px',
          borderRadius: '50px',
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '2rem'
        }}>
          <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></div>
          Acceso Restringido
        </div>

        {/* Foto y Datos del Usuario */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            margin: '0 auto 1.5rem',
            border: '4px solid var(--bg-secondary)',
            padding: '4px',
            background: 'white'
          }}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '32px', fontWeight: 800 }}>
                {user?.nombres?.charAt(0)}
              </div>
            )}
          </div>
          <h2 style={{ fontFamily: 'Source Sans 3', fontSize: '24px', margin: '0 0 8px' }}>{user?.nombres} {user?.apellidos}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>{user?.correo}</p>
        </div>

        {/* Mensaje Principal */}
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '1.5rem',
          borderRadius: '20px',
          marginBottom: '2rem',
          textAlign: 'left',
          border: '1px solid var(--border-soft)'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ flexShrink: 0 }}>
              <Icons.AlertTriangle color="#ef4444" size={24} />
            </span>
            <div>
              <h4 style={{ margin: '0 0 8px', fontSize: '16px', color: 'var(--text-primary)' }}>Cuenta Desactivada</h4>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Tu perfil ha sido desactivado por el administrador del sistema. Para más detalles sobre tu registro, acude a la administración del sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            onClick={handleLogout}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-soft)',
              padding: '14px',
              borderRadius: '12px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--border-soft)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
          >
            <Icons.ArrowLeft size={18} />
            Volver a la Página Principal
          </button>
        </div>

        {/* Footer del Ticket */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '2px dashed var(--border-soft)', position: 'relative' }}>
          {/* Muescas laterales del ticket */}
          <div style={{ position: 'absolute', top: '-11px', left: '-36px', width: '20px', height: '20px', background: 'var(--bg-primary)', borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', top: '-11px', right: '-36px', width: '20px', height: '20px', background: 'var(--bg-primary)', borderRadius: '50%' }}></div>

          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Comercial Flores del Campo
          </p>
        </div>
      </div>
    </div>
  );
}

