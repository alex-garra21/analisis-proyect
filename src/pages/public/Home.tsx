import Hero from './Hero';
import Stats from './Stats';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Hero />
      <Stats />
    </div>
  );
}