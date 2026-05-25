import { motion } from 'framer-motion';
import { Icons } from './Icons';
import { fadeUp, staggerContainer } from '../lib/motion';

type Plan = {
  name: string;
  pkg: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlight?: boolean;
};

type Props = { onSelect: (pkg: string) => void };

export const Pricing = ({ onSelect }: Props) => {
  const plans: Plan[] = [
    {
      name: 'Modernisation Essentielle',
      pkg: 'Essentielle',
      price: '399,99',
      description: 'Landing page moderne',
      features: ['Modernisation visuelle', 'Version mobile optimisée', 'Structure professionnelle', 'CTA clair', 'Livraison rapide'],
      cta: "Demander une évaluation",
    },
    {
      name: 'Modernisation Plus',
      pkg: 'Plus',
      price: '499,99',
      description: 'Landing page + logo',
      features: ['Landing page moderne', 'Modernisation du logo', 'Image plus professionnelle', 'Design cohérent', 'Idéal pour PME locales'],
      cta: "Demander une évaluation",
      highlight: true,
    },
    {
      name: 'Modernisation Pro',
      pkg: 'Pro',
      price: '799,99',
      description: 'Landing page + 3 pages + logo',
      features: ['Site plus complet', 'Présentation des services', 'Page contact', 'SEO local de base', 'Branding cohérent'],
      cta: "Demander une évaluation",
    },
    {
      name: 'Modernisation Complète',
      pkg: 'Complète',
      price: '999,99',
      description: 'Image complète PME',
      features: ['Landing page', '3 pages', 'Logo', 'Contenu médias sociaux', '2 publications par mois pendant 12 mois'],
      cta: "Demander une évaluation",
    },
  ];

  return (
    <section className="bg-ink-800">
      <div className="max-w-[1200px] mx-auto px-8 py-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="text-center text-brand font-semibold tracking-[0.18em] text-[12px] mb-3">
            NOS FORFAITS
          </div>
          <h2 className="text-center font-display font-extrabold text-white text-[40px] leading-[1.1] tracking-tight mb-3">
            Des forfaits simples. Sans surprise.
          </h2>
          <p className="text-center text-white/65 text-[16px] mb-12">
            Choisissez le niveau de modernisation adapté à votre entreprise.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {plans.map((p) => {
            const isHighlight = !!p.highlight;
            return (
              <motion.div
                key={p.name}
                variants={fadeUp}
                whileHover={{
                  scale: 1.02,
                  y: -4,
                  boxShadow: '0 12px 36px -6px rgba(234,88,12,0.22)',
                }}
                transition={{ duration: 0.2 }}
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
                <div className="text-white/50 text-[13px] mt-1">{p.description}</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display font-extrabold text-white text-[42px] leading-none tracking-tight">{p.price}</span>
                  <span className="text-brand font-display font-extrabold text-[24px] leading-none">$</span>
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
                  onClick={() => onSelect(p.pkg)}
                  className={[
                    'mt-7 w-full py-3 rounded-md font-semibold text-[14px] transition-colors cursor-pointer',
                    isHighlight
                      ? 'bg-brand hover:bg-brand-600 text-white'
                      : 'border border-white/25 hover:border-white/60 text-white',
                  ].join(' ')}
                >
                  {p.cta}
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
