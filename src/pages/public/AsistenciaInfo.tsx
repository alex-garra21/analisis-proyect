import { Icons } from '../../components/Icons';
import PublicContainer from '../../components/layout/PublicContainer';

export default function AsistenciaInfo() {
  const features = [
    {
      Icon: Icons.QrCode,
      title: "Acceso Instantáneo",
      desc: "Olvídate de las filas. Lee el código QR de la conferencia con tu dispositivo móvil y valida tu asistencia."
    },
    {
      Icon: Icons.Award,
      title: "Diplomas Digitales",
      desc: "Tu asistencia es validada automáticamente por el sistema QR. Tu diploma se enviará posteriormente al correo que proporciones en tu perfil, garantizando la validez de tu participación."
    },
    {
      Icon: Icons.Shield,
      title: "Seguridad y Control",
      desc: "Cada asistencia es única y está vinculada a tu perfil. Esto nos permite mantener un control de preciso y garantizar que la experiencia sea cómoda y segura para los asistentes."
    }
  ];

  return (
    <PublicContainer
      badge="Tecnología"
      title="Control de Asistencia QR"
      description="Innovación y agilidad en cada entrada."
    >
      <div className="robotics-rules-grid" style={{ marginTop: '2rem' }}>
        {features.map((f, i) => (
          <div key={i} className="robotics-rule-card">
            <div className="robotics-rule-icon">
              <f.Icon size={32} />
            </div>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </PublicContainer>
  );
}
