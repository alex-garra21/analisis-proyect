import { useNavigate } from 'react-router-dom';

interface LandingStatCardProps {
  value: string;
  label: string;
  link?: string;
}

export const LandingStatCard: React.FC<LandingStatCardProps> = ({ value, label, link }) => {
  const navigate = useNavigate();

  const innerContent = (
    <>
      <span className="stat-n">{value}</span>
      <span className="stat-l">{label}</span>
    </>
  );

  return (
    <div
      className="stat"
      onClick={() => link && navigate(link)}
      style={{ cursor: link ? 'pointer' : 'default' }}
    >
      {innerContent}
    </div>
  );
};
