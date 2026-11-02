import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/routeMap';
import PublicContainer from '../../components/layout/PublicContainer';
import { COTIZACIONES, formatQuetzales, totalCotizacion } from '../../data/localData';
import { createMaskedUrl } from '../../utils/routerHasher';

const cell = { padding: '0.75rem 1rem', textAlign: 'left' as const, borderBottom: '1px solid rgba(128,128,128,0.2)' };

export default function CotizacionesPage() {
  const navigate = useNavigate();
  return (
    <PublicContainer badge="Ventas" title="Cotizaciones" description="Cotizaciones de prueba (datos locales).">
      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
          <thead>
            <tr>{['No.', 'Cliente', 'Fecha', 'Estado', 'Total'].map((h) => <th key={h} style={cell}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {COTIZACIONES.map((c) => (
              <tr
                key={c.id}
                id={`cotizacion-${c.numero}`}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(createMaskedUrl(ROUTES.cotizaciones, c.id))}
              >
                <td style={cell}>{c.numero}</td>
                <td style={cell}>{c.cliente}</td>
                <td style={cell}>{c.fecha}</td>
                <td style={cell}>{c.estado}</td>
                <td style={cell}>{formatQuetzales(totalCotizacion(c))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PublicContainer>
  );
}
