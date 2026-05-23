import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustBar } from './components/TrustBar';
import { BeforeAfter } from './components/BeforeAfter';
import { WhySigna } from './components/WhySigna';
import { Realisations } from './components/Realisations';
import { Pricing } from './components/Pricing';
import { CtaBand } from './components/CtaBand';

function App() {
  return (
    <main className="min-h-screen bg-ink-800 text-white">
      <div className="hero-glow">
        <Header />
        <Hero />
      </div>
      <TrustBar />
      <BeforeAfter />
      <WhySigna />
      <Realisations />
      <Pricing />
      <CtaBand />
    </main>
  );
}

export default App;
