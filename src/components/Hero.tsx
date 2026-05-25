import { motion } from 'framer-motion';
import { Icons } from './Icons';
import { SiteMockup } from './SiteMockup';
import { fadeUp, staggerContainer } from '../lib/motion';

type Props = { onOpenForm: () => void };

export const Hero = ({ onOpenForm }: Props) => {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-8 pt-10 pb-16 grid grid-cols-12 gap-8 items-center">
        {/* Left copy */}
        <motion.div
          className="col-span-12 lg:col-span-6 relative z-10"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="text-brand font-semibold tracking-[0.18em] text-[13px] mb-5">
            SITES WEB &nbsp;•&nbsp; LOGOS &nbsp;•&nbsp; BRANDING
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-display font-extrabold text-white text-[64px] leading-[1.02] tracking-tight">
            Votre entreprise mérite<br />
            une image à la hauteur<br />
            de votre <span className="text-brand">service.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 text-white/70 text-[16px] leading-relaxed max-w-[440px]">
            Modernisation de sites web, logos et présence en ligne pour PME québécoises.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <motion.button
              onClick={onOpenForm}
              whileHover={{ boxShadow: '0 0 24px rgba(234,88,12,0.5)' }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-md bg-brand hover:bg-brand-600 transition-colors text-white font-semibold cursor-pointer"
            >
              Demander une évaluation gratuite
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/15">
                <Icons.ArrowRight className="w-3.5 h-3.5" />
              </span>
            </motion.button>
            <a href="#" className="inline-flex items-center px-6 py-3.5 rounded-md border border-white/25 hover:border-white/50 transition-colors text-white font-semibold">
              Voir nos réalisations
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] text-white/75">
            <motion.span
              className="inline-flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <Icons.Bolt className="w-4 h-4 text-brand" />
              <strong className="text-white font-semibold">Livraison rapide</strong>
            </motion.span>
            <motion.span
              className="inline-flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.4 }}
            >
              <Icons.Dollar className="w-4 h-4 text-brand" />
              <strong className="text-white font-semibold">Prix fixes simples</strong>
            </motion.span>
            <motion.span
              className="inline-flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              <Icons.Maple className="w-4 h-4 text-brand" />
              <strong className="text-white font-semibold">100% québécois</strong>
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Right: device cluster */}
        <motion.div
          className="col-span-12 lg:col-span-6 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          <motion.div
            className="relative h-[460px]"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Orange glow blob */}
            <div className="absolute -top-10 right-0 w-[420px] h-[420px] rounded-full bg-brand/30 blur-3xl"></div>

            {/* Laptop */}
            <div className="absolute left-0 top-2 w-[560px] max-w-full">
              <div className="rounded-[14px] bg-[#1e2533] p-2 shadow-screen">
                <SiteMockup brand="Excavation Dubois" className="rounded-md" />
              </div>
              {/* Laptop base */}
              <div className="relative">
                <div className="h-3 bg-gradient-to-b from-[#3a414d] to-[#1c2230] rounded-b-[14px]"></div>
                <div className="h-4 mx-[-22px] bg-gradient-to-b from-[#2a313e] to-[#11161f] rounded-b-[18px]"></div>
                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-20 h-1.5 bg-ink-900/80 rounded-b-md"></div>
              </div>
            </div>

            {/* Phone */}
            <div className="absolute right-2 bottom-[-30px] w-[170px]">
              <div className="rounded-[28px] bg-[#0f1420] p-1.5 shadow-screen ring-1 ring-white/5">
                <div className="rounded-[22px] overflow-hidden bg-ink-800 relative">
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-3 bg-black rounded-full z-10"></div>
                  <SiteMockup brand="Excavation Dubois" className="rounded-[22px]" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
