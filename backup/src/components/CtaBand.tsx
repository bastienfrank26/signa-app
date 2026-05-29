import { motion } from 'framer-motion';
import { Icons } from './Icons';
import { fadeUp, staggerContainer } from '../lib/motion';

type Props = { onOpenForm: () => void };

export const CtaBand = ({ onOpenForm }: Props) => {
  return (
    <motion.section
      className="bg-brand text-white"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="max-w-[1200px] mx-auto px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div variants={fadeUp}>
          <h3 className="font-display font-extrabold text-[28px] leading-tight tracking-tight">
            Votre présence en ligne travaille-t-elle vraiment pour vous?
          </h3>
          <p className="mt-1 text-white/85 text-[15px]">Faites analyser gratuitement votre site web, votre logo ou votre image actuelle.</p>
        </motion.div>
        <motion.button
          variants={fadeUp}
          onClick={onOpenForm}
          whileHover={{ boxShadow: '0 0 28px rgba(234,88,12,0.55)', scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="inline-flex items-center gap-3 self-start md:self-auto px-6 py-3.5 rounded-md bg-ink-800 hover:bg-ink-900 transition-colors text-white font-semibold whitespace-nowrap cursor-pointer"
        >
          Demander une évaluation gratuite
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/15">
            <Icons.ArrowRight className="w-3.5 h-3.5" />
          </span>
        </motion.button>
      </div>
      <div className="border-t border-white/20">
        <div className="max-w-[1200px] mx-auto px-8 py-3 flex flex-wrap items-center justify-center gap-x-10 gap-y-2 text-[13px] text-white/90">
          <span>Prix fixes | Processus simple | Service 100% québécois</span>
        </div>
      </div>
    </motion.section>
  );
};
