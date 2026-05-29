declare const Header: any;
declare const Hero: any;
declare const TrustBar: any;
declare const BeforeAfter: any;
declare const WhySigna: any;
declare const Realisations: any;
declare const Pricing: any;
declare const CtaBand: any;

const App = () => {
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
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
