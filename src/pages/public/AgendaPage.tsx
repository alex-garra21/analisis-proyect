import { useState } from 'react';
import { useCharlas } from '../../api/hooks/useAgenda';
import type { AgendaItem } from '../../data/agendaData';
import WorkshopBadge from '../../components/workshops/WorkshopBadge';
import AgendaModal from '../../components/AgendaModal';
import CalendarLink from '../../components/CalendarLink';
import LocationLink from '../../components/LocationLink';
import { Icons } from '../../components/Icons';
import PublicContainer from '../../components/layout/PublicContainer';

import { timeToMinutes } from '../../utils/timeUtils';

export default function AgendaPage() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'Mañana' | 'Tarde'>('Mañana');
  const [charlaSeleccionada, setCharlaSeleccionada] = useState<AgendaItem | null>(null);
  const { data: agenda = [], isLoading } = useCharlas();

  const charlasFiltradas = agenda
    .filter(item => {
      const minutes = timeToMinutes(item.time);
      const isMorning = minutes < 13 * 60; // Punto de corte: 1:00 PM
      return periodoSeleccionado === 'Mañana' ? isMorning : !isMorning;
    })
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  return (
    <PublicContainer
      title="Agenda del evento"
      description={
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px', alignItems: 'center' }}>
          <CalendarLink>
            <div
              style={{
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              <Icons.Calendar size={16} color="var(--accent-primary)" />
              <p style={{ margin: 0 }}>Sábado 23 de Mayo —</p>
            </div>
          </CalendarLink>
          <LocationLink>
            <div
              style={{
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              <Icons.Map size={16} color="var(--accent-primary)" />
              <p style={{ margin: 0 }}>Hotel Alcazar Doña Victoria</p>
            </div>
          </LocationLink>
        </div>
      }
    >

      {/* TABS para Periodos */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', justifyContent: 'center' }}>
        {(['Mañana', 'Tarde'] as const).map(periodo => (
          <button
            key={periodo}
            className="btn-solid"
            style={{
              background: periodoSeleccionado === periodo ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              color: periodoSeleccionado === periodo ? 'white' : 'var(--text-primary)',
              border: periodoSeleccionado !== periodo ? '1px solid var(--border-soft)' : 'none',
              minWidth: '150px'
            }}
            onClick={() => setPeriodoSeleccionado(periodo)}
          >
            JORNADA {periodo.toUpperCase()}
          </button>
        ))}
      </div>

      {/* LISTA DE LA AGENDA */}
      <div className="agenda-list">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            Cargando agenda...
          </div>
        ) : charlasFiltradas.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                background: 'var(--accent-light)',
                padding: '20px',
                borderRadius: '24px',
                color: 'var(--accent-primary)'
              }}>
                <Icons.ClipboardList size={48} strokeWidth={1.5} />
              </div>
            </div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontFamily: 'Source Sans 3, sans-serif' }}>Programa próximamente</h3>
            <p style={{ fontSize: '0.95rem' }}>
              La jornada de la {periodoSeleccionado.toLowerCase()} aún no ha sido publicada.<br />
              Vuelve pronto para ver las conferencias confirmadas.
            </p>
          </div>
        ) : (
          charlasFiltradas.map(charla => (
            <div
              key={charla.id}
              className="agenda-list-item"
              onClick={() => setCharlaSeleccionada(charla)}
            >
              <div className="agenda-time">
                {charla.time}
              </div>

              <div className="agenda-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#16a34a',
                    background: '#f0fdf4',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <Icons.Map size={12} strokeWidth={2.5} color="var(--accent-primary)" />
                    {charla.room}
                  </div>
                </div>
                <h3>{charla.title}</h3>
                <p style={{ minHeight: '1.2em' }}>
                  {charla.speaker ? charla.speaker.name : ''}
                </p>
              </div>

              <div>
                <WorkshopBadge tag={charla.tag} />
              </div>
            </div>
          ))
        )}
      </div>

      <AgendaModal
        isOpen={charlaSeleccionada !== null}
        item={charlaSeleccionada}
        onClose={() => setCharlaSeleccionada(null)}
      />

    </PublicContainer>
  );
}