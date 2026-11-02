import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { type AgendaItem, type Speaker, generateSlug } from '../../utils/agendaStore';
import { useCharlas } from '../../api/hooks/useAgenda';
import { useAuth } from '../../api/hooks/useAuth';
import { loginUser, type UserData } from '../../utils/auth';
import { useMarkAttendance } from '../../api/hooks/useEnrollment';
import { Icons } from '../../components/Icons';

// Utility to parse time strings like "9:00 AM" to Date objects
function parseTimeStr(timeStr: string, baseDate?: string): Date {
  if (!timeStr) return new Date();
  const parts = timeStr.trim().split(' ');
  if (parts.length < 2) return new Date();
  const [time, modifier] = parts;
  let [hours, minutes] = time.split(':').map(Number);

  if (hours === 12) {
    hours = modifier === 'PM' ? 12 : 0;
  } else if (modifier === 'PM') {
    hours += 12;
  }

  let date: Date;
  if (baseDate) {
    date = new Date(`${baseDate}T00:00:00`);
  } else {
    date = new Date();
  }

  date.setHours(hours, minutes, 0, 0);
  return date;
}

export default function AttendancePage() {
  const { workshopId } = useParams<{ workshopId: string }>();
  const [workshop, setWorkshop] = useState<AgendaItem | null>(null);
  const [speaker, setSpeaker] = useState<Speaker | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedUser, setConfirmedUser] = useState<UserData | null>(null);
  const [confirmationTime, setConfirmationTime] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user: authUser } = useAuth();
  const markAttendanceMutation = useMarkAttendance();

  const { data: agenda = [], isLoading } = useCharlas();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (workshopId && agenda.length > 0) {
      const item = agenda.find(a => a.id === workshopId || generateSlug(a.title) === workshopId);
      if (item) {
        setWorkshop(item);
        if (item.speaker) {
          setSpeaker(item.speaker as Speaker);
        }

        // CHEQUEO AUTOMÁTICO: Si el usuario ya está logueado, verificar si ya confirmó asistencia
        if (authUser) {
          setEmail(authUser.correo);
          const existing = authUser.asistencias?.find(a => a.workshopId === item.id);
          if (existing) {
            setConfirmedUser(authUser);
            setConfirmationTime(existing.timestamp);
            setIsSuccess(true);
          }
        }
      }
    }
  }, [workshopId, agenda, authUser]);

  const handleConfirmAttendance = async (e?: React.FormEvent, isQuickConfirm: boolean = false) => {
    if (e) e.preventDefault();
    setError('');

    if (!workshop) {
      setError('Conferencia no encontrada.');
      return;
    }

    let user: UserData | null = null;

    if (isQuickConfirm && authUser) {
      user = authUser;
    } else {
      if (!email || !password) {
        setError('El usuario o la contraseña es incorrecto o no está registrado en el sistema.');
        return;
      }
      const loginResult = await loginUser(email, password);
      if (!loginResult.success || !loginResult.user) {
        setError('El usuario o la contraseña es incorrecto o no está registrado en el sistema.');
        return;
      }
      user = loginResult.user;
    }
    
    if (!user || !user.id) {
      return;
    }

    const isEnrolled = user.talleres?.some(t => t.id === workshop.id);
    if (!isEnrolled) {
      setError('No apareces inscrito en esta conferencia. Primero debes agregarla a tu agenda en la sección "Mis Conferencias" de tu perfil.');
      return;
    }

    // VALIDACIÓN DE FECHA
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    if (workshop.date && workshop.date !== todayStr) {
      const workshopDateObj = new Date(`${workshop.date}T12:00:00`);
      const formattedWorkshopDate = workshopDateObj.toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' });
      setError(`Esta conferencia está programada para el día ${formattedWorkshopDate}. Solo puedes confirmar asistencia el mismo día del evento.`);
      return;
    }

    const startTime = parseTimeStr(workshop.time, workshop.date);
    const endTime = parseTimeStr(workshop.endTime, workshop.date);

    const graceMinutes = workshop.gracePeriod !== undefined ? workshop.gracePeriod : 10;
    endTime.setMinutes(endTime.getMinutes() + graceMinutes);

    if (currentTime < startTime || currentTime > endTime) {
      setError(`La confirmación de asistencia está disponible desde el inicio de la conferencia (${workshop.time}) hasta ${graceMinutes} minutos después de su finalización (${workshop.endTime}).`);
      return;
    }

    const existingConfirmation = user.asistencias?.find(a => a.workshopId === workshop.id);
    if (existingConfirmation) {
      setConfirmedUser(user);
      setConfirmationTime(existingConfirmation.timestamp);
      setIsSuccess(true);
      return;
    }

    try {
      await markAttendanceMutation.mutateAsync({ userId: user.id, workshopId: workshop.id });
    } catch (error) {
      // Error silencioso en la nube para no mostrar anuncios adicionales
      return;
    }

    const timestamp = new Date().toISOString();
    setConfirmedUser(user);
    setConfirmationTime(timestamp);
    setIsSuccess(true);
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString('es-GT', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const checkIsOutOfTime = () => {
    if (!workshop) return true;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (workshop.date && workshop.date !== todayStr) return true;

    const startTime = parseTimeStr(workshop.time, workshop.date);
    const endTime = parseTimeStr(workshop.endTime, workshop.date);
    const graceMinutes = workshop.gracePeriod !== undefined ? workshop.gracePeriod : 10;
    endTime.setMinutes(endTime.getMinutes() + graceMinutes);
    return currentTime < startTime || currentTime > endTime;
  };

  const isOutOfTime = checkIsOutOfTime();

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Cargando información de la conferencia...</p>
      </div>
    );
  }

  if (!workshop) {
    return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', padding: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ color: '#1a365d', marginBottom: '1rem', fontFamily: 'Source Sans 3' }}>Conferencia no encontrada</h2>
          <p style={{ color: '#4a5568', marginBottom: '2rem' }}>El código de la conferencia proporcionado no es válido o ya no existe.</p>
          <Link to="/" style={{ color: '#3182ce', textDecoration: 'none', fontWeight: 600 }}>Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, background: '#e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', fontFamily: 'Inter, sans-serif' }}>

      {/* Tarjeta del Taller */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#0a2540',
        borderRadius: '16px',
        padding: '2rem',
        color: 'white',
        marginBottom: '1rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            letterSpacing: '1px', 
            color: isOutOfTime ? '#fc8181' : '#63b3ed', 
            textTransform: 'uppercase', 
            marginBottom: '8px' 
          }}>
            {isOutOfTime ? 'Conferencia fuera de horario' : 'Conferencia en curso'}
          </p>
          <h1 style={{ fontSize: '28px', fontFamily: 'Source Sans 3', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {workshop.title}
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem', fontSize: '14px', color: '#e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Calendar size={16} />
              {workshop.date ? new Date(`${workshop.date}T12:00:00`).toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Fecha por confirmar'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Clock size={16} />
              {workshop.time} – {workshop.endTime}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Users size={16} />
              {speaker ? speaker.name : 'General'}
            </div>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: 600 }}>
            <Icons.Map size={14} color="#ffffff" /> {workshop.room}
          </div>
        </div>
      </div>

      {/* Formulario / Estado de Éxito */}
      {(!isOutOfTime || isSuccess) && (
        <div style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          {!isSuccess ? (
            <>
              {authUser ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    backgroundColor: '#eef6ff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#1971c2', 
                    fontWeight: 700, 
                    fontSize: '20px',
                    margin: '0 auto 1rem'
                  }}>
                    {authUser.nombres[0]}{authUser.apellidos[0]}
                  </div>
                  <h2 style={{ fontSize: '22px', fontFamily: 'Source Sans 3', fontWeight: 800, color: '#1a202c', marginBottom: '8px' }}>
                    ¡Hola, {authUser.nombres.split(' ')[0]}!
                  </h2>
                  <p style={{ fontSize: '14px', color: '#718096', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    Hemos detectado tu sesión activa. ¿Deseas confirmar tu asistencia a esta conferencia?
                  </p>

                  {error && (
                    <div style={{ backgroundColor: '#fff5f5', color: '#c53030', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '1.5rem', border: '1px solid #feb2b2' }}>
                      {error}
                    </div>
                  )}

                  <button
                    onClick={(e) => handleConfirmAttendance(e, true)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: '#0ca678',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      boxShadow: '0 4px 12px rgba(12, 166, 120, 0.3)'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#099268'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#0ca678'}
                  >
                    Sí, confirmar ahora
                  </button>

                  <button
                    onClick={() => {
                      import('../../utils/supabase').then(m => m.supabase.auth.signOut());
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3182ce',
                      fontSize: '13px',
                      marginTop: '1.5rem',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    No soy yo, usar otra cuenta
                  </button>
                </div>
              ) : (
                <>
                  <h2 style={{ fontSize: '22px', fontFamily: 'Source Sans 3', fontWeight: 800, color: '#1a202c', marginBottom: '8px' }}>
                    Identifícate para confirmar
                  </h2>
                  <p style={{ fontSize: '14px', color: '#718096', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    Ingresa tus datos una sola vez. Este dispositivo te recordará para futuras conferencias.
                  </p>

                  {error && (
                    <div style={{ backgroundColor: '#fff5f5', color: '#c53030', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '1.5rem', border: '1px solid #feb2b2' }}>
                      {error}
                    </div>
                  )}

                  <form onSubmit={(e) => handleConfirmAttendance(e, false)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#4a5568', marginBottom: '6px', textTransform: 'uppercase' }}>
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="correo@ejemplo.com"
                        required
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '15px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#4a5568', marginBottom: '6px', textTransform: 'uppercase' }}>
                        Contraseña
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Tu contraseña"
                          required
                          style={{ width: '100%', padding: '12px 16px', paddingRight: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '15px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {showPassword ? (
                            <Icons.Eye size={18} color="#a0aec0" />
                          ) : (
                            <Icons.EyeOff size={18} color="#a0aec0" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: '#1971c2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginTop: '0.5rem',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = '#1864ab'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = '#1971c2'}
                    >
                      Confirmar asistencia
                    </button>
                  </form>
                </>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #edf2f7' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#eef6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1971c2', fontWeight: 700, fontSize: '18px' }}>
                  {(confirmedUser?.nombres?.[0] || '')}{(confirmedUser?.apellidos?.[0] || '')}
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#1a202c' }}>{confirmedUser?.nombres} {confirmedUser?.apellidos}</div>
                  <div style={{ fontSize: '13px', color: '#718096' }}>{confirmedUser?.correo}</div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#f0f9ff',
                borderRadius: '16px',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <div style={{ width: '64px', height: '64px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <Icons.Check size={32} color="#0ca678" strokeWidth={2.5} />
                </div>

                <h2 style={{ fontSize: '24px', fontFamily: 'Source Sans 3', fontWeight: 800, color: '#1a365d', marginBottom: '1rem', lineHeight: 1.2 }}>
                  ¡Ya confirmaste tu<br />asistencia!
                </h2>
                <p style={{ color: '#4a5568', fontSize: '14px', marginBottom: '2rem', lineHeight: 1.5 }}>
                  Tu presencia en esta conferencia ya fue registrada correctamente.
                </p>

                <div style={{ width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                    <span style={{ color: '#718096' }}>Participante</span>
                    <span style={{ fontWeight: 600, color: '#1a202c', textAlign: 'right' }}>{confirmedUser?.nombres} {confirmedUser?.apellidos?.split(' ')[0]}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                    <span style={{ color: '#718096' }}>Conferencia</span>
                    <span style={{ fontWeight: 600, color: '#1a202c', textAlign: 'right', maxWidth: '150px' }}>{workshop.title}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                    <span style={{ color: '#718096' }}>Sala</span>
                    <span style={{ fontWeight: 600, color: '#1a202c', textAlign: 'right' }}>{workshop.room}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#718096' }}>Registrado</span>
                    <span style={{ fontWeight: 600, color: '#1a202c', textAlign: 'right' }}>{formatDate(confirmationTime)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isOutOfTime && !isSuccess && (
        <div style={{
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
          marginTop: '2rem',
          color: '#4a5568'
        }}>
          <p style={{ fontSize: '14px' }}>
            {(() => {
              const today = new Date();
              const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              if (workshop.date && workshop.date !== todayStr) {
                return 'Esta conferencia no está programada para hoy.';
              }
              return 'La confirmación de asistencia se habilitará automáticamente cuando inicie la conferencia.';
            })()}
          </p>
        </div>
      )}
    </div>
  );
}

