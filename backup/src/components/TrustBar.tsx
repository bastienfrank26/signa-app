import { Icons } from './Icons';

export const TrustBar = () => {
  const logos = [
    { Icon: Icons.House,  kicker: 'Construction', name: 'Larocque' },
    { Icon: Icons.Garage, kicker: 'Garage',       name: 'M. Blais' },
    { Icon: Icons.Leaf,   kicker: 'Paysagiste',   name: 'Nature Verte' },
    { Icon: Icons.Truck,  kicker: 'Transport',    name: 'Gagnon' },
    { Icon: Icons.Hammer, kicker: 'Ébénisterie',  name: 'Lagacé' },
    { Icon: Icons.Wrench, kicker: 'Plomberie',    name: 'Côté' },
  ];
  return (
    <section className="bg-ink-800 border-t border-white/5">
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        <p className="text-center text-white/55 text-[14px] mb-8">
          Déjà la confiance de plusieurs entreprises d'ici
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-6 gap-x-4">
          {logos.map(({ Icon, kicker, name }) => (
            <div key={name} className="flex items-center justify-center gap-2.5 text-white/75">
              <Icon className="w-7 h-7 shrink-0 opacity-80" />
              <div className="leading-tight">
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/45">{kicker}</div>
                <div className="font-display font-extrabold tracking-tight text-[14px]">{name.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
