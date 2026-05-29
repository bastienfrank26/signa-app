import { motion } from 'framer-motion';
import { Icons } from './Icons';
import { SiteMockup } from './SiteMockup';
import { fadeUp } from '../lib/motion';

export const BeforeAfter = () => {
  return (
    <section className="bg-cream-100 text-ink-800">
      <div className="max-w-[1200px] mx-auto px-8 py-20 grid grid-cols-12 gap-10 items-center">
        <motion.div
          className="col-span-12 lg:col-span-4"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="text-brand font-semibold tracking-[0.18em] text-[13px] mb-5">
            AVANT / APRÈS
          </div>
          <h2 className="font-display font-extrabold text-[44px] leading-[1.05] tracking-tight">
            Un nouveau look.<br />De nouveaux clients.
          </h2>
          <p className="mt-5 text-ink-800/65 text-[15px] leading-relaxed max-w-[360px]">
            On modernise votre image pour que vous inspiriez confiance dès le premier clic.
          </p>
        </motion.div>

        <motion.div
          className="col-span-12 lg:col-span-8"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <SiteMockup brand="Les Entreprises Paquette inc." variant="legacy" photoLabel="ancienne photo" cta="Contactez-nous" />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-ink-800 text-white text-[11px] font-semibold tracking-[0.18em]">
                AVANT
              </div>
            </div>
            <div className="shrink-0 w-10 h-10 rounded-full bg-ink-800 text-white grid place-items-center shadow-card">
              <Icons.ArrowRight className="w-4 h-4" />
            </div>
            <div className="flex-1 relative">
              <SiteMockup brand="Les Entreprises Paquette inc." variant="modern" photoLabel="nouvelle photo" />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-brand text-white text-[11px] font-semibold tracking-[0.18em]">
                APRÈS
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
