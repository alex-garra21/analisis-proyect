import { useState, useEffect, useMemo } from 'react';
import { maskPath } from '../../../routes/routeMap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../api/hooks/useAuth';
import { updateUserDataMutation } from '../../../api/supabase/users/userMutations';
import ModuleTitle from '../../../components/ModuleTitle';
import { useCharlas, useSalas } from '../../../api/hooks/useAgenda';
import { syncUserEnrollmentsMutation } from '../../../api/supabase/enrollment/enrollmentMutations';
import type { AgendaItem } from '../../../data/agendaData';
import {showToast } from '../../../utils/swal';
import { Icons } from '../../../components/Icons';
import Modal from '../../../components/ui/Modal';
import BackButton from '../../../components/ui/BackButton';
import AdminButton from '../../../components/ui/AdminButton';
import { timeToMinutes } from '../../../utils/timeUtils';

import { CalendarGrid } from './components/CalendarGrid';
import { useAgendaConfig } from '../../../api/hooks/useAgendaConfig';

export default function WorkshopsModule() {
  const navigate = useNavigate();
  const { user, refetchProfile } = useAuth();
  const { data: charlas } = useCharlas();
  const { data: salas } = useSalas();
  const { config: visualConfig } = useAgendaConfig();

  const agenda = useMemo(() => charlas || [], [charlas]);
  const rooms = useMemo(() => salas || [], [salas]);

  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [selectedWorkshop, setSelectedWorkshop] = useState<AgendaItem | null>(null);
  const isPaid = user?.pagoValidado || false;

useEffect(() => {
  if (user?.correo) {
    if (!user.pagoValidado) {
      // Modo Preview: Bloqueado para todos si no hay pago validado.
      setIsConfirmed(false);
      setEnrolledIds([]);
      return;
    }

    //EXTRAER TALLERES REALES DE LA BASE DE DATOS
    const dbWorkshops = user.talleres ? user.talleres.filter(t => t.category !== 'GENERAL') : [];
    const hasRealWorkshops = dbWorkshops.length > 0;

    //Detectar si el backend fue limpiado por un administrador
    if (!hasRealWorkshops && localStorage.getItem(`workshops_confirmed_${user.correo}`)) {
      localStorage.removeItem(`workshops_confirmed_${user.correo}`);
      localStorage.removeItem(`workshops_${user.correo}`);
      localStorage.removeItem(`modifications_count_${user.correo}`);
    }

    //LEER CONFIRMACIÓN DEL LOCAL STORAGE O DE LA BASE DE DATOS
    const localConfirmed = localStorage.getItem(`workshops_confirmed_${user.correo}`);
    
    // Si el usuario ya confirmó (localmente o porque ya existen talleres en la Base de Datos) 
    // y no hay choque de horarios, bloqueamos la pantalla de inmediato con lo que tenga.
    if ((localConfirmed === 'true' || hasRealWorkshops) && !user.alertaChoqueHorario) {
      setIsConfirmed(true);
      const onlyWorkshops = dbWorkshops.map(t => t.id);
      setEnrolledIds(onlyWorkshops);
      return; // Bloqueo total. No permite volver a seleccionar.
    }

    // 3. LOGICA SI EL USUARIO TIENE PERMITIDO EDITAR (AÚN NO CONFIRMADO)
    if (user.alertaChoqueHorario && hasRealWorkshops) {
      setIsConfirmed(false);
      const onlyWorkshops = dbWorkshops.map(t => t.id);
      setEnrolledIds(onlyWorkshops);
    } else {
      const saved = localStorage.getItem(`workshops_${user.correo}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const electivesOnly = parsed.filter((id: string) => {
              const w = agenda.find(a => a.id === id);
              return w?.tag?.toUpperCase().trim() !== 'GENERAL';
            });
            setEnrolledIds(electivesOnly);
          } else {
            localStorage.removeItem(`workshops_${user.correo}`);
          }
        } catch (e) {
          console.error('Error parsing saved workshops:', e);
          localStorage.removeItem(`workshops_${user.correo}`);
        }
      } else {
        const onlyWorkshops = dbWorkshops.map(t => t.id);
        setEnrolledIds(onlyWorkshops);
      }
    }
  }
},[user?.correo, user?.talleres, user?.pagoValidado, user?.alertaChoqueHorario, agenda]);

  useEffect(() => {
    if (user?.correo) localStorage.setItem(`workshops_${user.correo}`, JSON.stringify(enrolledIds));
  }, [enrolledIds, user?.correo]);


  let minHour = 8, maxTimeMinutes = 17 * 60;
  if (agenda.length > 0) {
    const times = agenda.map((w: AgendaItem) => timeToMinutes(w.time)).filter(t => !isNaN(t));
    const endTimes = agenda.map((w: AgendaItem) => timeToMinutes(w.endTime)).filter(t => !isNaN(t));
    
    if (times.length > 0) minHour = Math.floor(Math.min(...times) / 60);
    if (endTimes.length > 0) maxTimeMinutes = Math.max(...endTimes);
    
    if (minHour * 60 >= maxTimeMinutes) maxTimeMinutes = minHour * 60 + 60;
  }
  const totalRows = Math.round((maxTimeMinutes / 60 - minHour) * 12);
  const maxHour = Math.ceil(maxTimeMinutes / 60);
  const HOURS = []; for (let i = minHour; i <= maxHour; i++) HOURS.push(i);

  const roomColors = [
    { main: '#6366f1', bg: 'rgba(99, 102, 241, 0.05)', card: 'rgba(99, 102, 241, 0.08)', border: 'rgba(99, 102, 241, 0.2)' }, // Indigo
    { main: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.05)', card: 'rgba(14, 165, 233, 0.08)', border: 'rgba(14, 165, 233, 0.2)' }, // Sky
    { main: '#10b981', bg: 'rgba(16, 185, 129, 0.05)', card: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)' }, // Emerald
    { main: '#f59e0b', bg: 'rgba(245, 158, 11, 0.05)', card: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)' }, // Amber
    { main: '#ec4899', bg: 'rgba(236, 72, 153, 0.05)', card: 'rgba(236, 72, 153, 0.08)', border: 'rgba(236, 72, 153, 0.2)' }, // Pink
    { main: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.05)', card: 'rgba(139, 92, 246, 0.08)', border: 'rgba(139, 92, 246, 0.2)' }, // Violet
    { main: '#f43f5e', bg: 'rgba(244, 63, 94, 0.05)', card: 'rgba(244, 63, 94, 0.08)', border: 'rgba(244, 63, 94, 0.2)' },  // Rose
    { main: '#06b6d4', bg: 'rgba(6, 182, 212, 0.05)', card: 'rgba(6, 182, 212, 0.08)', border: 'rgba(6, 182, 212, 0.2)' }   // Cyan
  ];

  const getWorkshopStyles = (w: AgendaItem, isSelected: boolean) => {
    const rowsPerHour = 12; // Cada fila son 5 minutos
    const startRow = Math.round((timeToMinutes(w.time) / 60 - minHour) * rowsPerHour) + 2;
    const endRow = Math.round((timeToMinutes(w.endTime) / 60 - minHour) * rowsPerHour) + 2;
    const roomIndex = rooms.findIndex(r => r.id === w.locationId || r.name === w.room);
    const colIndex = roomIndex !== -1 ? roomIndex + 2 : 2;
    const colorTheme = roomColors[(colIndex - 2) % roomColors.length];

    return {
      gridRow: `${startRow} / ${endRow}`,
      gridColumn: colIndex,
      backgroundColor: isSelected ? undefined : colorTheme.card,
      borderColor: isSelected ? undefined : colorTheme.border,
      color: isSelected ? undefined : colorTheme.main
    };
  };

  const isTimeCollision = (workshop: AgendaItem) => {
    if (workshop.tag === 'GENERAL') return false;
    const start = timeToMinutes(workshop.time) / 60, end = timeToMinutes(workshop.endTime) / 60;
    return enrolledIds.some(id => {
      const other = agenda.find((a: AgendaItem) => a.id === id);
      if (!other || other.id === workshop.id || other.tag === 'GENERAL') return false;
      const oStart = timeToMinutes(other.time) / 60, oEnd = timeToMinutes(other.endTime) / 60;
      return (start < oEnd) && (oStart < end);
    });
  };

  const toggleEnroll = (workshop: AgendaItem) => {
    const isGeneral = workshop.tag?.toUpperCase().trim() === 'GENERAL';
    if (!isPaid || isConfirmed || isGeneral) return;
    if (enrolledIds.includes(workshop.id)) {
      setEnrolledIds(prev => prev.filter(id => id !== workshop.id));
    } else {
      if (isTimeCollision(workshop)) {
        showToast('Conflicto de horario: Esta conferencia tiene un conflicto con tu selección actual.', 'warning');
        return;
      }
      setEnrolledIds(prev => [...prev, workshop.id]);
    }
  };

  const hasCurrentCollision = () => {
    for (let i = 0; i < enrolledIds.length; i++) {
      const w1 = agenda.find(a => a.id === enrolledIds[i]);
      if (!w1 || w1.tag?.toUpperCase().trim() === 'GENERAL') continue;
      const start1 = timeToMinutes(w1.time), end1 = timeToMinutes(w1.endTime);
      
      for (let j = i + 1; j < enrolledIds.length; j++) {
        const w2 = agenda.find(a => a.id === enrolledIds[j]);
        if (!w2 || w2.tag?.toUpperCase().trim() === 'GENERAL') continue;
        const start2 = timeToMinutes(w2.time), end2 = timeToMinutes(w2.endTime);
        
        if (start1 < end2 && start2 < end1) return true;
      }
    }
    return false;
  };

  const handleCardClick = (workshop: AgendaItem) => {
    setSelectedWorkshop(workshop);
  };

  const handleConfirm = async () => {
    setSaveStatus('saving');
    if (user?.id) {
      // Importante: No borrar las actividades GENERALES que ya tiene el usuario.
      const generalActivities = (user.talleres || []).filter(t => t.category === 'GENERAL');
      const generalIds = generalActivities.map(t => t.id);

      const allToSave = Array.from(new Set([...enrolledIds, ...generalIds]));
      const result = await syncUserEnrollmentsMutation(user.id, allToSave);

      if (result.success) {
        
      const localConfirmed = localStorage.getItem(`workshops_confirmed_${user.correo}`) === 'true';
      const dbWorkshops = (user.talleres || []).filter(t => t.category !== 'GENERAL');
      
      if (localConfirmed || dbWorkshops.length > 0) {
        localStorage.setItem(`modifications_count_${user.correo}`, '1');
      }

        // Obtenemos los objetos completos para actualizar el estado local de user
        const newTalleresObjects = [
          ...enrolledIds.map(id => ({ id, category: agenda.find(a => a.id === id)?.tag || '' })),
          ...generalActivities
        ];

        await updateUserDataMutation({ ...user, talleres: newTalleresObjects, alertaChoqueHorario: false });
        localStorage.setItem(`workshops_confirmed_${user.correo}`, 'true');
        setIsConfirmed(true);
        setShowSuccessModal(true);
        setSaveStatus('saved');
        refetchProfile();
      } else {
        showToast(result.message || 'No se pudo guardar la selección.', 'error');
        setSaveStatus('idle');
      }
    }
  };

  const handleCancelEdit = () => {
    // Restaurar los IDs desde el perfil del usuario
    if (user?.talleres) {
      const onlyWorkshops = user.talleres.filter(t => t.category !== 'GENERAL').map(t => t.id);
      setEnrolledIds(onlyWorkshops);
    } else {
      setEnrolledIds([]);
    }
    setIsConfirmed(true);
    setSaveStatus('idle');
  };


  return (
    <div className="workshops-module" style={{
      padding: '0',
      '--agenda-row-height': `${visualConfig.row_height}px`,
      '--agenda-font-title': `${visualConfig.font_size_title}px`,
      '--agenda-font-time': `${visualConfig.font_size_time}px`,
      '--agenda-font-speaker': `${visualConfig.font_size_speaker}px`,
      '--agenda-card-padding': `${visualConfig.card_padding}px`,
      '--agenda-card-radius': `${visualConfig.card_border_radius}px`
    } as any}>
      <div style={{ padding: '2rem 2.5rem 0' }}>
        <ModuleTitle title="Inscripción de Conferencias" />
      </div>

      <div style={{ padding: '0 2.5rem' }}>
        {!isPaid && (
          <div style={{
            marginBottom: '2rem',
            borderRadius: '24px',
            padding: '1.5rem 2rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-soft)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '6px',
              background: '#fab005'
            }} />
            <div style={{ 
              background: 'rgba(250, 176, 5, 0.1)', 
              width: '50px', 
              height: '50px', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#f08c00'
            }}>
              <Icons.AlertTriangle size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', fontSize: '17px', marginBottom: '4px', color: 'var(--text-primary)' }}>Modo Vista Previa</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                Explora la agenda completa. Valida tu pago en el módulo de <span style={{ textDecoration: 'underline', fontWeight: 700, cursor: 'pointer', color: 'var(--accent-primary)' }} onClick={() => navigate(maskPath('/dashboard/pago'))}>Pagos</span> para habilitar tu inscripción.
              </p>
            </div>
          </div>
        )}

        {user?.alertaChoqueHorario && (
          <div onClick={() => {
            setIsConfirmed(false);
            document.getElementById('agenda-grid')?.scrollIntoView({ behavior: 'smooth' });
          }} style={{
            marginBottom: '2rem',
            borderRadius: '24px',
            padding: '1.5rem 2rem',
            background: 'var(--bg-card)',
            border: '2px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer'
          }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '6px',
              background: '#ef4444'
            }} />
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              width: '50px', 
              height: '50px', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#ef4444'
            }}>
              <Icons.AlertTriangle size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', fontSize: '17px', marginBottom: '4px', color: '#ef4444' }}>Atención: Cambio en la Agenda</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                Debido a un cambio reciente en el horario por parte de la administración, tu selección de conferencias tiene un conflicto. <strong>Se ha habilitado tu selección nuevamente y no cuenta como una modificación.</strong> Por favor, corrige las conferencias que tienen un conflicto y vuelve a guardar.
              </p>
            </div>
          </div>
        )}

        <div id="agenda-grid">
          <CalendarGrid
            rooms={rooms} HOURS={HOURS} minHour={minHour} totalRows={totalRows}
            roomColors={roomColors} agenda={agenda}
            enrolledIds={enrolledIds} isConfirmed={isConfirmed}
            isTimeCollision={isTimeCollision} toggleEnroll={handleCardClick}
            getWorkshopStyles={getWorkshopStyles}
          />
        </div>

        {/* Listado de Talleres Seleccionados */}
        <div className="selection-summary-container" style={{ marginTop: '3rem' }}>
          <h3 style={{
            fontFamily: 'Source Sans 3',
            fontWeight: 800,
            fontSize: '18px',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Icons.ClipboardList size={22} color="var(--accent-primary)" />
            Conferencias Seleccionadas
          </h3>

          <div className="selection-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Actividades Generales (Obligatorias) */}
            {agenda
              .filter(a => a.tag?.toUpperCase().trim() === 'GENERAL')
              .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
              .map(workshop => (
              <div key={`summary-${workshop.id}`} className="selection-item mandatory">
                <div className="selection-item-info">
                  <span className="selection-item-room">{workshop.room}</span>
                  <span className="selection-item-title">{workshop.title}</span>
                  <span className="selection-item-time">{workshop.time} - {workshop.endTime}</span>
                </div>
                <div className="selection-item-badge">Obligatorio</div>
              </div>
            ))}

            {enrolledIds
              .map(id => agenda.find(a => a.id === id))
              .filter((w): w is AgendaItem => !!w && w.tag?.toUpperCase().trim() !== 'GENERAL')
              .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
              .map(workshop => (
                <div key={`summary-${workshop.id}`} className="selection-item">
                  <div className="selection-item-info">
                    <span className="selection-item-room">{workshop.room}</span>
                    <span className="selection-item-title">{workshop.title}</span>
                    <span className="selection-item-time">{workshop.time} - {workshop.endTime}</span>
                  </div>
                  {!isConfirmed && (
                    <button
                      className="selection-item-remove"
                      onClick={() => toggleEnroll(workshop)}
                      title="Quitar selección"
                    >
                      <Icons.X size={16} />
                    </button>
                  )}
                </div>
              ))}

            {enrolledIds.length === 0 && (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                background: 'var(--bg-app)',
                borderRadius: '16px',
                border: '1px dashed var(--border-soft)',
                color: 'var(--text-secondary)',
                fontSize: '14px'
              }}>
                Aún no has seleccionado ninguna conferencia. Haz clic en las tarjetas del calendario para agregarlas.
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '3rem 0' }}>
          {isPaid && (() => {
            const wasAlreadyConfirmed = localStorage.getItem(`workshops_confirmed_${user?.correo}`) === 'true';

            //Elimiacion del botón de edición de talleres
            if (isConfirmed) {
              return (
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px', background: 'var(--bg-app)', padding: '1rem 2rem', borderRadius: '12px', border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icons.Shield size={16} color="var(--text-secondary)" /> Selección Definitiva Guardada
                </div>
              );
            }

            return (
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', width: '100%' }}>
                <AdminButton
                  size="lg"
                  onClick={handleConfirm}
                  disabled={enrolledIds.length === 0 || saveStatus === 'saving' || hasCurrentCollision()}
                  icon={saveStatus === 'saving' ? <Icons.Clock size={20} /> : <Icons.Check size={20} />}
                  className="admin-btn-hover"
                  style={{
                    padding: '1.2rem 4.5rem',
                    borderRadius: '100px',
                    background: enrolledIds.length === 0 ? '#e2e8f0' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderColor: 'transparent',
                    boxShadow: enrolledIds.length === 0 ? 'none' : '0 15px 30px -10px rgba(16, 185, 129, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {saveStatus === 'saving' 
                    ? 'Guardando...' 
                    : wasAlreadyConfirmed 
                      ? 'Confirmar Cambio' 
                      : `Inscribir ${enrolledIds.filter(id => {
                          const w = agenda.find(a => a.id === id);
                          return w?.tag?.toUpperCase().trim() !== 'GENERAL';
                        }).length} Conferencias`
                  }
                </AdminButton>

                {wasAlreadyConfirmed && !user?.alertaChoqueHorario && (
                  <button
                    onClick={handleCancelEdit}
                    className="btn-ghost"
                    style={{
                      padding: '1.2rem 3rem',
                      borderRadius: '100px',
                      border: '2px solid #cbd5e1',
                      background: 'transparent',
                      color: '#475569',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.borderColor = '#94a3b8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            );
          })()}

          {isConfirmed && (
            <BackButton 
              to={maskPath('/dashboard/diploma')} 
              label="Validar Datos para Diploma"
              icon={<Icons.Award size={18} color="#ffffff" />}
            />
          )}
        </div>
      </div>

      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="¡Inscripción Exitosa!" maxWidth="420px">
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <Icons.Check size={40} strokeWidth={3} />
          </div>
          <h3 style={{ fontFamily: 'Source Sans 3', fontWeight: 800, fontSize: '20px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <Icons.Star size={24} color="#fab005" /> ¡Todo Listo!
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>Tus conferencias han sido registrados correctamente en el sistema. Puedes consultar tu horario detallado en el dashboard principal.</p>
          <AdminButton onClick={() => setShowSuccessModal(false)} style={{ width: '100%' }}>Excelente</AdminButton>
        </div>
      </Modal>

      {/* Modal de Detalle de Taller */}
      <Modal
        isOpen={!!selectedWorkshop}
        onClose={() => setSelectedWorkshop(null)}
        title={selectedWorkshop?.title}
        maxWidth="550px"
      >
        {selectedWorkshop && (() => {
          const isSelected = enrolledIds.includes(selectedWorkshop.id);
          const isMandatory = selectedWorkshop.tag?.toUpperCase().trim() === 'GENERAL';
          const isCollision = !isSelected && !isMandatory && isTimeCollision(selectedWorkshop);

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  background: 'rgba(24, 95, 165, 0.1)',
                  color: 'var(--accent-primary)',
                  padding: '6px 14px',
                  borderRadius: '100px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Icons.Map size={14} color="var(--accent-primary)" /> {selectedWorkshop.room}
                </span>
                <span style={{
                  background: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  padding: '6px 14px',
                  borderRadius: '100px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid var(--border-soft)'
                }}>
                  <Icons.Clock size={14} /> {selectedWorkshop.time} - {selectedWorkshop.endTime}
                </span>
              </div>

              {selectedWorkshop.description && selectedWorkshop.description.trim() !== '' && (
                <div style={{ background: 'var(--bg-app)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-soft)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Descripción</h4>
                  <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                    {selectedWorkshop.description}
                  </p>
                </div>
              )}

              {selectedWorkshop.speaker && selectedWorkshop.speaker.name && selectedWorkshop.speaker.name !== 'Por definir' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '0.5rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icons.User size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ponente</h4>
                    <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedWorkshop.speaker.name}</p>
                  </div>
                </div>
              )}

              {selectedWorkshop.maxQuotas && selectedWorkshop.maxQuotas > 0 ? (
                <div style={{ padding: '0 0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Disponibilidad de Cupos</span>
                    <span style={{ color: (selectedWorkshop.occupiedQuotas || 0) >= selectedWorkshop.maxQuotas ? '#ef4444' : 'var(--accent-primary)' }}>
                      {selectedWorkshop.occupiedQuotas || 0} / {selectedWorkshop.maxQuotas}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-app)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-soft)' }}>
                    <div style={{
                      width: `${Math.min(((selectedWorkshop.occupiedQuotas || 0) / selectedWorkshop.maxQuotas) * 100, 100)}%`,
                      height: '100%',
                      background: (selectedWorkshop.occupiedQuotas || 0) >= selectedWorkshop.maxQuotas ? '#ef4444' : 'var(--accent-primary)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  {(selectedWorkshop.occupiedQuotas || 0) >= selectedWorkshop.maxQuotas && !isSelected && (
                    <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: 700, marginTop: '8px', textAlign: 'center' }}>
                      ¡Cupos agotados para esta conferencia!
                    </p>
                  )}
                </div>
              ) : null}

              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Información de traslape sobre los botones */}
                {isCollision && !isSelected && (
                  <div style={{
                    color: '#862e00',
                    fontSize: '12px',
                    fontWeight: 700,
                    textAlign: 'center',
                    background: '#fff3bf',
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid #fab005',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <Icons.AlertTriangle size={16} />
                    Conflicto de horario detectado
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                  <div style={{ flex: 1.5 }}>
                    {isPaid && !isConfirmed && !isMandatory ? (
                      <AdminButton
                        fullWidth
                        variant={isSelected ? 'outline' : 'primary'}
                        onClick={() => {
                          toggleEnroll(selectedWorkshop);
                          setSelectedWorkshop(null);
                        }}
                        disabled={isCollision || (!isSelected && (selectedWorkshop.maxQuotas || 0) > 0 && (selectedWorkshop.occupiedQuotas || 0) >= (selectedWorkshop.maxQuotas || 0))}
                        icon={isSelected ? <Icons.Trash size={18} /> : <Icons.Check size={18} />}
                        style={isSelected ? { borderColor: '#e03131', color: '#e03131' } : {}}
                      >
                        {isSelected ? 'Quitar' : 'Inscribirme'}
                      </AdminButton>
                    ) : isMandatory ? (
                      <div style={{ height: '100%', padding: '0 1rem', borderRadius: '12px', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', border: '1px solid var(--border-soft)', textAlign: 'center', textTransform: 'uppercase' }}>
                        Obligatorio
                      </div>
                    ) : !isPaid ? (
                      <AdminButton fullWidth disabled icon={<Icons.AlertTriangle size={16} />} style={{ fontSize: '13px' }}>
                        Bloqueado
                      </AdminButton>
                    ) : isConfirmed ? (
                      <div style={{ height: '100%', padding: '0 1rem', borderRadius: '12px', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', border: '1px solid var(--border-soft)', textAlign: 'center', textTransform: 'uppercase' }}>
                        Finalizado
                      </div>
                    ) : null}
                  </div>

                  <div style={{ flex: 1 }}>
                    <AdminButton
                      fullWidth
                      variant="ghost"
                      onClick={() => setSelectedWorkshop(null)}
                      style={{
                        color: '#e03131',
                        background: 'rgba(224, 49, 49, 0.05)'
                      }}
                    >
                      Cerrar
                    </AdminButton>
                  </div>
                </div>

                {!isPaid && (
                  <p style={{ fontSize: '11px', textAlign: 'center', color: '#f08c00', fontWeight: 600, marginTop: '-5px' }}>
                    * Valida tu pago para habilitar la inscripción.
                  </p>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      <style>{`
        .calendar-container {
          background: var(--bg-card);
          border-radius: 28px;
          padding: 2rem;
          border: 1px solid var(--border-soft);
          overflow-x: auto;
          box-shadow: var(--shadow-md);
          margin-bottom: 2rem;
        }
        .calendar-grid { 
          display: grid; 
          min-width: 900px; 
          position: relative; 
          border-radius: 16px;
          overflow: hidden;
          background: var(--bg-app);
          grid-template-rows: 60px repeat(${HOURS.length * 12}, var(--agenda-row-height));
          border: 1px solid var(--border-soft);
        }
        .grid-header { 
          font-family: 'Source Sans 3', sans-serif; 
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          z-index: 20; 
          background: var(--bg-card); 
          border-bottom: 1px solid var(--border-soft);
        }
        .time-label { 
          font-weight: 800; 
          font-size: 11px; 
          color: #64748b;
          letter-spacing: 0.5px;
        }
        .room-label { 
          font-weight: 900; 
          font-size: 12px;
          letter-spacing: 1.5px;
          transition: all 0.2s;
        }
        .hour-row-label {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 8px;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          border-right: 1px solid var(--border-soft);
          background: var(--bg-card);
          z-index: 10;
        }
        .hour-grid-line {
          border-top: 1px dashed var(--border-soft);
          pointer-events: none;
          z-index: 5;
        }
        .calendar-workshop { 
          margin: 4px; 
          padding: var(--agenda-card-padding); 
          border-radius: var(--agenda-card-radius); 
          cursor: pointer; 
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
          display: flex; 
          flex-direction: column; 
          border: 1px solid transparent;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
          background-clip: padding-box;
        }
        .calendar-workshop:hover:not(.blocked) { 
          transform: translateY(-3px); 
          box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.15); 
          z-index: 50; 
        }
        .calendar-workshop .w-title {
          display: block;
          overflow: visible;
        }
        .calendar-workshop.selected { 
          background: linear-gradient(135deg, #185fa5 0%, #0c3b69 100%) !important; 
          color: white !important; 
          border-color: #082d52; 
          box-shadow: 0 8px 16px -4px rgba(24, 95, 165, 0.4); 
          z-index: 25; 
        }
        .calendar-workshop.mandatory {
          background: rgba(255, 255, 255, 0.02);
          border: 1.5px dashed var(--border-med);
          cursor: default;
          opacity: 0.9;
        }
        .calendar-workshop.mandatory.selected {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
          border-color: var(--border-soft);
          opacity: 1;
        }
        .w-title { 
          font-size: var(--agenda-font-title); 
          font-weight: 800; 
          font-family: 'Source Sans 3', sans-serif; 
          line-height: 1.25; 
          margin: 8px 0; 
          display: block;
          overflow: visible;
          text-overflow: clip;
          flex: 1;
        }
        .w-time { 
          font-size: var(--agenda-font-time); 
          font-weight: 700; 
          background: rgba(0,0,0,0.05);
          padding: 3px 8px;
          border-radius: 8px;
          align-self: flex-start;
          color: inherit;
          margin-bottom: 4px;
          letter-spacing: 0.3px;
        }
        .calendar-workshop.selected .w-time {
          background: rgba(255,255,255,0.2);
        }
        .w-speaker { 
          font-size: var(--agenda-font-speaker); 
          font-weight: 600; 
          opacity: 0.85; 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          margin-top: auto;
          white-space: normal;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .selected-check { 
          position: absolute; 
          top: 10px; 
          right: 10px; 
          background: rgba(255,255,255,0.9); 
          color: #185fa5; 
          width: 22px; 
          height: 22px; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          backdrop-filter: blur(4px);
        }
        .calendar-workshop.mandatory.selected .selected-check {
          color: #0f172a;
        }

        /* Selection Summary List Styles */
        .selection-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 1rem 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-soft);
          border-radius: 16px;
          transition: all 0.2s;
          box-shadow: var(--shadow-sm);
        }
        .selection-item:hover {
          border-color: var(--accent-primary);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transform: translateX(5px);
        }
        .selection-item.mandatory {
          background: rgba(255, 255, 255, 0.02);
          border-left: 4px solid var(--accent-primary);
          border-right: 1px solid var(--border-soft);
          border-top: 1px solid var(--border-soft);
          border-bottom: 1px solid var(--border-soft);
        }
        .selection-item.mandatory .selection-item-title {
          color: var(--text-secondary);
          font-weight: 700;
        }
        .selection-item-info {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex: 1;
        }
        .selection-item-room {
          font-weight: 800;
          font-size: 11px;
          text-transform: uppercase;
          color: var(--accent-primary);
          background: rgba(24, 95, 165, 0.08);
          padding: 4px 10px;
          border-radius: 6px;
          min-width: 90px;
          text-align: center;
        }
        .selection-item.mandatory .selection-item-room {
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-soft);
        }
        .selection-item-badge {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 100px;
          background: var(--bg-app);
          color: var(--text-muted);
          border: 1px solid var(--border-soft);
          letter-spacing: 1px;
        }
        .selection-item.mandatory .selection-item-badge {
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-primary);
          border-color: rgba(59, 130, 246, 0.2);
        }
        }
        .selection-item-title {
          font-weight: 700;
          font-size: 15px;
          color: var(--text-primary);
          flex: 1;
        }
        .selection-item-time {
          font-weight: 600;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .selection-item-badge {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          background: #0f172a;
          color: white;
          padding: 4px 12px;
          border-radius: 100px;
        }
        .selection-item-remove {
          background: none;
          border: none;
          color: #f03e3e;
          padding: 8px;
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 1rem;
        }
        .selection-item-remove:hover {
          background: #fff5f5;
          transform: rotate(90deg);
        }

        /* RESPONSIVE ADJUSTMENTS */
        @media (max-width: 768px) {
          .workshops-module > div {
            padding: 1.5rem 1rem !important;
          }
          
          .calendar-container {
            padding: 1rem;
            border-radius: 16px;
            margin: 0 -0.5rem 2rem;
          }

          .calendar-grid {
            min-width: 800px; /* Un poco más compacto */
          }

          .selection-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            padding: 1.25rem;
          }

          .selection-item-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
            width: 100%;
          }

          .selection-item-room {
            min-width: unset;
            width: fit-content;
          }

          .selection-item-remove {
            position: absolute;
            top: 1rem;
            right: 1rem;
          }

          .selection-item-title {
            font-size: 14px;
          }

          .w-title {
            font-size: 11px;
          }

          .w-time {
            font-size: 9px;
            padding: 2px 6px;
          }
          
          .w-speaker {
            font-size: 9px;
          }
        }

        /* Estilo de la barra de desplazamiento horizontal */
        .calendar-container::-webkit-scrollbar {
          height: 6px;
        }
        .calendar-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .calendar-container::-webkit-scrollbar-thumb {
          background: var(--accent-primary);
          border-radius: 10px;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}

