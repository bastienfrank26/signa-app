declare const Icons: any;

type Pillar = { Icon: any; title: string; body: string };

const WhySigna = () => {
  const pillars: Pillar[] = [
    { Icon: Icons.Bolt,    title: 'Rapide',    body: 'Votre site web livré en quelques jours, pas en quelques mois.' },
    { Icon: Icons.Dollar,  title: 'Abordable', body: 'Des forfaits mensuels transparents à partir de 79$/mois.' },
    { Icon: Icons.Monitor, title: 'Moderne',   body: 'Design nouvelle génération propulsé par l\u2019IA.' },
  ];

  return (
    <section className="bg-ink-800">
      <div className="max-w-[1200px] mx-auto px-8 py-20">
        <div className="text-center text-brand font-semibold tracking-[0.18em] text-[12px] mb-10">
          POURQUOI CHOISIR SIGNA ?
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {pillars.map(({ Icon, title, body }) => (
            <div key={title} className="px-8 py-6 flex items-start gap-5">
              <div className="shrink-0 w-14 h-14 rounded-full border-2 border-brand grid place-items-center text-brand">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="font-display font-bold text-[22px] tracking-tight">{title}</div>
                <p className="mt-1.5 text-white/65 text-[14px] leading-relaxed max-w-[260px]">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

(window as any).WhySigna = WhySigna;
