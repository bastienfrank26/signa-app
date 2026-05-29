import { motion } from 'framer-motion';
import { SiteMockup } from './SiteMockup';
import { fadeUp, staggerContainer } from '../lib/motion';

type Project = { brand: string; name: string; sector: string; photoLabel: string };

export const Realisations = () => {
  const projects: Project[] = [
    { brand: 'Construction Larocque', name: 'Construction Larocque', sector: 'Construction',         photoLabel: 'chantier excavation' },
    { brand: 'Garage M. Blais',       name: 'Garage M. Blais',       sector: 'Mécanique automobile', photoLabel: 'atelier camion' },
    { brand: 'Nature Verte',          name: 'Nature Verte',          sector: 'Paysagement',          photoLabel: 'aménagement jardin' },
    { brand: 'Plomberie Côté',        name: 'Plomberie Côté',        sector: 'Plomberie',            photoLabel: 'équipe technicienne' },
  ];

  return (
    <section className="bg-cream-100 text-ink-800">
      <div className="max-w-[1200px] mx-auto px-8 py-20">
        <motion.div
          className="flex items-end justify-between gap-6 mb-10"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div>
            <div className="text-brand font-semibold tracking-[0.18em] text-[12px] mb-3">
              RÉALISATIONS RÉCENTES
            </div>
            <h2 className="font-display font-extrabold text-[36px] leading-[1.1] tracking-tight max-w-[520px]">
              Des sites qui font rayonner<br />les entreprises d'ici.
            </h2>
          </div>
          <a href="#" className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-md border border-ink-800/20 hover:border-ink-800/50 transition-colors text-ink-800 text-[14px] font-semibold">
            Voir toutes nos réalisations
          </a>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {projects.map((p) => (
            <motion.div
              key={p.name}
              variants={fadeUp}
              whileHover={{ scale: 1.02, y: -4, boxShadow: '0 12px 36px -6px rgba(0,0,0,0.15)' }}
              transition={{ duration: 0.2 }}
              className="group"
            >
              <div className="rounded-xl overflow-hidden ring-1 ring-ink-800/5 shadow-card bg-ink-800">
                <SiteMockup brand={p.brand} photoLabel={p.photoLabel} />
              </div>
              <div className="mt-4">
                <div className="font-display font-bold text-[16px] tracking-tight">{p.name}</div>
                <div className="text-ink-800/55 text-[13px]">{p.sector}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
