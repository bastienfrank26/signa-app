import { useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustBar } from './components/TrustBar';
import { BeforeAfter } from './components/BeforeAfter';
import { WhySigna } from './components/WhySigna';
import { Realisations } from './components/Realisations';
import { Pricing } from './components/Pricing';
import { CtaBand } from './components/CtaBand';
import { EvaluationForm } from './components/EvaluationForm';

function App() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | undefined>();

  const openForm = (pkg?: string) => {
    setSelectedPackage(pkg);
    setFormOpen(true);
  };

  return (
    <MotionConfig reducedMotion="user">
    <main className="min-h-screen bg-ink-800 text-white">
      <div className="hero-glow">
        <Header onOpenForm={() => openForm()} />
        <Hero onOpenForm={() => openForm()} />
      </div>
      <TrustBar />
      <BeforeAfter />
      <WhySigna />
      <Realisations />
      <Pricing onSelect={(pkg) => openForm(pkg)} />
      <CtaBand onOpenForm={() => openForm()} />
      <EvaluationForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        preselectedPackage={selectedPackage}
      />
    </main>
    </MotionConfig>
  );
}

export default App;
