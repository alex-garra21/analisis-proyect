import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword, validatePasswordStrength } from '../../utils/auth';
import PasswordField from '../../components/PasswordField';
import { Icons } from '../../components/Icons';
import { showToast } from '../../utils/swal';
import PasswordRequirements from '../../components/PasswordRequirements';
import { supabase } from '../../utils/supabase';
import congresoHero from '../../assets/background-hero.png';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; avatar?: string } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    // Verificar si venimos de un flujo de recuperación real (URL o Storage)
    const isRecovery = localStorage.getItem('is_recovering_pw') === 'true' ||
      window.location.hash.includes('type=recovery') ||
      window.location.hash.includes('access_token=');

    if (!isRecovery) {
      console.warn("Acceso denegado: No se detectó flujo de recuperación.");
      navigate('/');
      return;
    }

    // Asegurar que la bandera esté en storage si vino por URL
    if (window.location.hash.includes('type=recovery')) {
      localStorage.setItem('is_recovering_pw', 'true');
    }

    fetchUserProfile();
  }, []);

  const fetchUserProfile = async (retries = 3) => {
    setIsLoadingProfile(true);
    try {
      // Intentar obtener la sesión (esperando a que Supabase procese el hash)
      let sessionData = await supabase.auth.getSession();

      // Si no hay sesión, esperar un poco y reintentar (útil en móviles lentos)
      if (!sessionData.data.session && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return fetchUserProfile(retries - 1);
      }

      const user = sessionData.data.session?.user;

      if (!user) {
        console.warn("No se encontró sesión de usuario tras reintentos.");
        navigate('/');
        return;
      }

      const { data: profile } = await supabase
        .from('usuarios')
        .select('nombres, apellidos, correo, avatar_url')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserProfile({
          name: `${profile.nombres} ${profile.apellidos}`,
          email: profile.correo,
          avatar: profile.avatar_url
        });
      }
    } catch (err) {
      console.error("Error fetching profile for reset page:", err);
      if (retries === 0) navigate('/');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordValidation = validatePasswordStrength(formData.newPassword);
    if (!passwordValidation.isValid) {
      showToast(passwordValidation.message, 'warning');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showToast('Las contraseñas no coinciden.', 'warning');
      return;
    }

    setIsSubmitting(true);
    const result = await changePassword(formData.newPassword);
    setIsSubmitting(false);

    if (result.success) {
      setShowSuccess(true);
    } else {
      showToast(result.message, 'error');
    }
  };

  const currentPasswordStrength = formData.newPassword.length > 0 ? validatePasswordStrength(formData.newPassword) : null;
  const passwordsMatch = formData.newPassword.length > 0 && formData.newPassword === formData.confirmPassword;
  const showMatchError = formData.confirmPassword.length > 0 && !passwordsMatch;

  return (
    <div className="reset-password-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      background: 'var(--bg-primary)',
      overflow: 'hidden',
      padding: '2rem'
    }}>
      {/* Fondo igual al Hero de la página principal */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${congresoHero})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.25,
        zIndex: 0
      }}></div>

      <div style={{
        position: 'absolute',
        top: '-80px',
        right: '-80px',
        width: '360px',
        height: '360px',
        background: 'var(--accent-light)', borderRadius: '50%', opacity: 0.4,
        pointerEvents: 'none',
        zIndex: 1
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        border: '1px solid var(--border-soft)'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'var(--accent-primary)',
            borderRadius: '15px',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <Icons.Check size={32} />
          </div>
          <h1 style={{ fontFamily: 'Source Sans 3', fontSize: '24px', color: 'var(--accent-primary)', margin: 0 }}>
            Comercial Flores del Campo
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Sistemas UMG - Cobán 2026
          </p>
        </div>

        {showSuccess ? (
          <div style={{ padding: '1rem 0' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <Icons.CheckCircle size={80} color="#16a34a" />
            </div>
            <h2 style={{ fontFamily: 'Source Sans 3', fontSize: '20px', color: '#16a34a', marginBottom: '1rem' }}>
              ¡Contraseña Actualizada!
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '15px', lineHeight: '1.6' }}>
              Tu cuenta ha sido protegida con la nueva contraseña. Ya puedes cerrar esta ventana e iniciar sesión normalmente.
            </p>
            <button className="submit-btn" style={{ width: '100%' }} onClick={() => {
              localStorage.removeItem('is_recovering_pw');
              navigate('/');
            }}>
              Ir al inicio de sesión
            </button>
          </div>
        ) : (
          <>
            {/* Tarjeta de Identidad */}
            <div style={{
              background: 'var(--bg-app)',
              padding: '1.25rem',
              borderRadius: '16px',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              textAlign: 'left',
              border: '1px solid var(--border-soft)'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                overflow: 'hidden',
                flexShrink: 0,
                fontSize: '20px',
                fontWeight: 800
              }}>
                {userProfile?.avatar ? (
                  <img src={userProfile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  userProfile?.name.charAt(0) || '?'
                )}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontFamily: 'Source Sans 3', color: 'var(--accent-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userProfile?.name || 'Verificando...'}
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userProfile?.email}
                </p>
              </div>
            </div>

            <h3 style={{ fontSize: '18px', marginBottom: '1.5rem', fontFamily: 'Source Sans 3' }}>Restablecer Contraseña</h3>


            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
              <PasswordField
                label="Nueva Contraseña"
                value={formData.newPassword}
                onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Min. 6 caracteres"
                required
                success={currentPasswordStrength?.isValid}
                autoComplete="new-password"
              />

              <div style={{ marginTop: '-10px' }}>
                {formData.newPassword.length > 0 && (
                  <PasswordRequirements requirements={currentPasswordStrength?.requirements || []} />
                )}
                {!formData.newPassword && (
                  <div style={{ fontSize: '15px', color: '#ff0000', marginBottom: '20px', fontWeight: 500 }}>
                    Requisitos: 6 caracteres, Mayúscula, Minúscula y Número.
                  </div>
                )}
              </div>

              <PasswordField
                label="Confirmar Nueva Contraseña"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="********"
                required
                success={passwordsMatch}
                error={showMatchError}
                autoComplete="new-password"
                style={{ marginBottom: '2.5rem' }}
              />

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    localStorage.removeItem('is_recovering_pw');
                    navigate('/');
                  }}
                  style={{ flex: 1, height: '50px', background: 'transparent', border: '1px solid var(--border-soft)', borderRadius: '12px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting || isLoadingProfile}
                  style={{ flex: 2, height: '50px', fontSize: '16px', opacity: (isSubmitting || isLoadingProfile) ? 0.7 : 1 }}
                >
                  {isSubmitting ? 'Guardando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

