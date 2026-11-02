import { useState, useEffect } from 'react';
import { maskPath } from '../../../routes/routeMap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../api/hooks/useAuth';
import ModuleTitle from '../../../components/ModuleTitle';
import AdminTabs from '../../../components/ui/AdminTabs';
import { useTimeConfig } from '../../../context/TimeContext';
import { Icons } from '../../../components/Icons';
import Modal from '../../../components/ui/Modal';
import AdminSelect from '../../../components/ui/AdminSelect';
import AdminButton from '../../../components/ui/AdminButton';
import { AVAILABLE_INTERVALS } from '../../../utils/timeUtils';
import BackButton from '../../../components/ui/BackButton';

// Importar Tabs
import ScheduleTab from './tabs/ScheduleTab';
import SpeakersTab from './tabs/SpeakersTab';
import CategoriesTab from './tabs/CategoriesTab';
import RoomsTab from './tabs/RoomsTab';
import { showConfirm, showToast } from '../../../utils/swal';
import { useDetectScheduleConflicts } from '../../../api/hooks/useAgenda';

export default function AgendaModule() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [agendaTab, setAgendaTab] = useState<'schedule' | 'speakers' | 'categories' | 'rooms'>('schedule');
  const { timeInterval, setTimeInterval } = useTimeConfig();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  const detectConflictsMutation = useDetectScheduleConflicts();

  const handleDetectConflicts = async () => {
    const confirmed = await showConfirm(
      '¿Escanear Conflictos de Horario?',
      'Se revisarán las inscripciones de todos los usuarios. Si sus conferencias seleccionadas tienen un conflicto de horario debido a cambios recientes, se les notificará y se les exigirá re-seleccionar. Esta acción no se puede deshacer.',
      'Sí, Escanear y Notificar',
      true
    );
    
    if (confirmed) {
      try {
        await detectConflictsMutation.mutateAsync();
        showToast('Escaneo completado. Se ha notificado a los usuarios afectados.', 'success');
      } catch (error: any) {
        showToast(`Error al escanear: ${error.message}`, 'error');
      }
    }
  };

  const isOnlyAdmin = user?.rol === 'admin';

  useEffect(() => {
    if (!isAuthLoading && user && !isOnlyAdmin) {
      navigate(maskPath('/dashboard/inicio'));
    }
  }, [user, isOnlyAdmin, isAuthLoading, navigate]);

  if (isAuthLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'var(--text-secondary)' }}>
        <div className="loader-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 179, 237, 0.2)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
        <span>Validando permisos...</span>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isOnlyAdmin) return null;

  return (
    <section className="dashboard-section">
      <div className="section-header" style={{ 
        marginBottom: '2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ flex: 1 }}>
          <ModuleTitle title="Gestión de Agenda" />
          <AdminTabs
            tabs={[
              { id: 'schedule', label: 'Horario' },
              { id: 'speakers', label: 'Ponentes' },
              { id: 'categories', label: 'Categorías' },
              { id: 'rooms', label: 'Salas' }
            ]}
            activeTab={agendaTab}
            onTabChange={(id) => setAgendaTab(id as any)}
          />
        </div>
        
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={handleDetectConflicts}
            disabled={detectConflictsMutation.isPending}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '10px',
              color: '#ef4444',
              cursor: detectConflictsMutation.isPending ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.2s',
              opacity: detectConflictsMutation.isPending ? 0.7 : 1
            }}
            onMouseOver={(e) => {
              if (!detectConflictsMutation.isPending) {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!detectConflictsMutation.isPending) {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
              }
            }}
          >
            {detectConflictsMutation.isPending ? <Icons.Clock size={18} /> : <Icons.AlertTriangle size={18} />}
            Escanear Conflictos
          </button>
          <button 
            onClick={() => setIsConfigOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-soft)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-soft)'}
          >
            <Icons.Settings size={18} />
            Configurar Intervalo
          </button>
        </div>
      </div>

      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title="Configuración de Horarios"
        maxWidth="400px"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Selecciona el intervalo de tiempo para los selectores de la agenda y asistencia.
          </p>
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '12px', 
              fontWeight: 600, 
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Intervalo de Tiempo
            </label>
            <AdminSelect
              value={timeInterval.toString()}
              onChange={(e) => setTimeInterval(parseInt(e.target.value, 10))}
              options={AVAILABLE_INTERVALS}
            />
          </div>

          <AdminButton onClick={() => setIsConfigOpen(false)} style={{ width: '100%' }}>
            Aplicar y Cerrar
          </AdminButton>
        </div>
      </Modal>

      <div className="tab-content">
        {agendaTab === 'schedule' && <ScheduleTab />}
        {agendaTab === 'speakers' && <SpeakersTab />}
        {agendaTab === 'categories' && <CategoriesTab />}
        {agendaTab === 'rooms' && <RoomsTab />}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', paddingBottom: '2rem' }}>
        <BackButton />
      </div>
    </section>
  );
}
