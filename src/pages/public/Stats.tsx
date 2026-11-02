import { LandingStatCard } from '../../components/ui/LandingStatCard';

export default function Stats() {
  const statsData = [
    { n: 'Alimentación Escolar', l: 'Mayo', link: 'calendar' },
    { n: 'Valija Didáctica', l: 'Ponentes', link: '/ponentes' },
    { n: 'Útiles Escolares', l: 'Charlas', link: '/agenda' },
    { n: 'Remozamiento', l: 'Participantes', link: '/participantes-info' },
    { n: 'Cotizar por Telegram', l: 'Participantes', link: '/participantes-info' },
  ];

  return (
    <div className="stats">
      {statsData.map((stat, index) => (
        <LandingStatCard 
          key={index}
          value={stat.n}
          label={stat.l}
          link={stat.link}
        />
      ))}
    </div>
  );
}