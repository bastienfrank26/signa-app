declare const Icons: any;

const CtaBand = () => {
  return (
    <section className="bg-brand text-white">
      <div className="max-w-[1200px] mx-auto px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="font-display font-extrabold text-[28px] leading-tight tracking-tight">
            Votre prochain client vous cherche déjà sur Google.
          </h3>
          <p className="mt-1 text-white/85 text-[15px]">Soyez là quand il vous cherche.</p>
        </div>
        <a href="#" className="inline-flex items-center gap-3 self-start md:self-auto px-6 py-3.5 rounded-md bg-ink-800 hover:bg-ink-900 transition-colors text-white font-semibold whitespace-nowrap">
          Commencer maintenant
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/15">
            <Icons.ArrowRight className="w-3.5 h-3.5" />
          </span>
        </a>
      </div>
      <div className="border-t border-white/20">
        <div className="max-w-[1200px] mx-auto px-8 py-3 flex flex-wrap items-center justify-center gap-x-10 gap-y-2 text-[13px] text-white/90">
          <span className="inline-flex items-center gap-2"><Icons.Check className="w-3.5 h-3.5" /> Sans frais cachés</span>
          <span className="opacity-40">|</span>
          <span className="inline-flex items-center gap-2"><Icons.Check className="w-3.5 h-3.5" /> Aucun contrat à long terme</span>
          <span className="opacity-40">|</span>
          <span className="inline-flex items-center gap-2"><Icons.Maple className="w-3.5 h-3.5" /> Support 100% québécois</span>
        </div>
      </div>
    </section>
  );
};

(window as any).CtaBand = CtaBand;
