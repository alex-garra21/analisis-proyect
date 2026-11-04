import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/routeMap';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-grid"></div>
      <div className="hero-accent"></div>

      <div className="hero-inner" style={{ display: 'flex', alignItems: 'center', gap: '4rem', maxWidth: '1100px', margin: '0 auto', flexWrap: 'wrap' }}>

        {/* Lado Derecho: Texto */}
        <div style={{ flex: '1.2 1 400px', position: 'relative', zIndex: 2 }}>
          {/* Contenedor vertical principal para el texto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

            {/* Fila 1: Logo y Título Principal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <h1 style={{ margin: 0 }}>COMERCIAL<br /><span>FLORES</span> DEL CAMPO</h1>
            </div>

            <h2 style={{ margin: 0 }}>INSUMOS EDUCATIVOS</h2>

            <p className="hero-sub" style={{ margin: 0, maxWidth: '600px' }}>
              Insumos escolares para los programas de apoyo del MINEDUC, valija didáctica, utiles escolares, alimentación escolar, remozamiento.
            </p>

            <div className="hero-ctas">
              <button 
                className="btn-solid" 
                onClick={() => navigate(ROUTES.catalogo)}
                style={{ padding: '16px 32px', fontSize: '15px' }}
              >
                Ver catálogo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
