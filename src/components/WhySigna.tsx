import { motion } from 'framer-motion';
import { Icons } from './Icons';
import { fadeUp, staggerContainer } from '../lib/motion';

import type { ReactElement } from 'react';

type Pillar = { Icon: (props: { className?: string }) => ReactElement; title: string; body: string };

export const WhySigna = () => {
  const pillars: Pillar[] = [
    { Icon: Icons.Bolt,    title: 'Rapide',       body: 'Votre nouvelle image livrée rapidement, sans processus compliqué.' },
    { Icon: Icons.Dollar,  title: 'Accessible',   body: "Des forfaits clairs à prix fixe conçus pour les PME d'ici." },
    { Icon: Icons.Monitor, title: 'Professionnel', body: 'Une présence en ligne moderne qui inspire confiance dès les premières secondes.' },
  ];

  return (
    <section className="bg-ink-800">
      <motion.div
        className="max-w-[1200px] mx-auto px-8 py-20"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        <motion.div variants={fadeUp} className="text-center text-brand font-semibold tracking-[0.18em] text-[12px] mb-10">
          POURQUOI CHOISIR SIGNA ?
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {pillars.map(({ Icon, title, body }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              whileHover={{ scale: 1.02, y: -4, boxShadow: '0 12px 36px -6px rgba(234,88,12,0.18)' }}
              transition={{ duration: 0.2 }}
              className="px-8 py-6 flex items-start gap-5"
            >
              <div className="shrink-0 w-14 h-14 rounded-full border-2 border-brand grid place-items-center text-brand">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="font-display font-bold text-[22px] tracking-tight">{title}</div>
                <p className="mt-1.5 text-white/65 text-[14px] leading-relaxed max-w-[260px]">{body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
