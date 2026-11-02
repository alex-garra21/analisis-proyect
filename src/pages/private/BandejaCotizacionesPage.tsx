import { useNavigate } from 'react-router-dom';
import { COTIZACIONES, formatQuetzales, totalCotizacion } from '../../data/localData';
import { createMaskedUrl } from '../../utils/routerHasher';
import { maskPath } from '../../routes/routeMap';

const cell = { padding: '0.7rem 1rem', textAlign: 'left' as const, borderBottom: '1px solid rgba(128,128,128,0.2)' };

/** Bandeja interna de cotizaciones (personal autenticado). */
export default function BandejaCotizacionesPage() {
  const navigate = useNavigate();
  const pendientes = COTIZACIONES.filter((c) => c.estado === 'Borrador' || c.estado === 'Enviada');

  return (
    <div style={{ color: 'var(--text-primary)' }}>
      <p>{pendientes.length} cotización(es) pendientes de gestión.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>{['No.', 'Cliente', 'Estado', 'Total'].map((h) => <th key={h} style={cell}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {COTIZACIONES.map((c) => (
            <tr
              key={c.id}
              id={`bandeja-${c.numero}`}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(createMaskedUrl(maskPath('/cotizaciones'), c.id))}
            >
              <td style={cell}>{c.numero}</td>
              <td style={cell}>{c.cliente}</td>
              <td style={cell}>{c.estado}</td>
              <td style={cell}>{formatQuetzales(totalCotizacion(c))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
