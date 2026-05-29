declare const Icons: any;

type Plan = {
  name: string;
  price: string;
  features: string[];
  cta: string;
  highlight?: boolean;
};

const Pricing = () => {
  const plans: Plan[] = [
    {
      name: 'Starter',
      price: '79',
      features: ['Site 1 page', 'Hébergement inclus', 'SEO de base'],
      cta: 'Choisir Starter',
    },
    {
      name: 'Pro',
      price: '149',
      features: ['Site 5 pages', 'Logo professionnel', 'Hébergement + maintenance', 'SEO local'],
      cta: 'Choisir Pro',
      highlight: true,
    },
    {
      name: 'Complet',
      price: '249',
      features: ['Site 5 pages et +', 'Logo + branding', 'Réseaux sociaux', 'Contenu mensuel'],
      cta: 'Choisir Complet',
    },
  ];

  return (
    <section className="bg-ink-800">
      <div className="max-w-[1200px] mx-auto px-8 py-20">
        <div className="text-center text-brand font-semibold tracking-[0.18em] text-[12px] mb-3">
          FORFAITS MENSUELS
        </div>
        <h2 className="text-center font-display font-extrabold text-white text-[40px] leading-[1.1] tracking-tight mb-12">
          Simple, transparent, sans surprise.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isHighlight = !!p.highlight;
            return (
              <div
                key={p.name}
                className={[
                  'relative rounded-2xl p-8 flex flex-col',
                  isHighlight
                    ? 'bg-ink-800 border-2 border-brand'
                    : 'bg-ink-800 border border-white/15',
                ].join(' ')}
              >
                {isHighlight && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-md bg-brand text-white text-[11px] font-semibold tracking-wide">
                    Le plus populaire
                  </span>
                )}

                <div className="text-white/85 font-semibold text-[16px]">{p.name}</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display font-extrabold text-white text-[56px] leading-none tracking-tight">{p.price}</span>
                  <span className="text-brand font-display font-extrabold text-[28px] leading-none">$</span>
                  <span className="text-white/55 text-[14px] ml-1">/mois</span>
                </div>

                <ul className="mt-6 space-y-2.5 text-white/80 text-[14px] flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Icons.Check className="w-4 h-4 mt-0.5 text-brand shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={[
                    'mt-7 w-full py-3 rounded-md font-semibold text-[14px] transition-colors',
                    isHighlight
                      ? 'bg-brand hover:bg-brand-600 text-white'
                      : 'border border-white/25 hover:border-white/60 text-white',
                  ].join(' ')}
                >
                  {p.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

(window as any).Pricing = Pricing;
