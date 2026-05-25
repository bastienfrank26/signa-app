type Props = { onOpenForm: () => void };

export const Header = ({ onOpenForm }: Props) => {
  const links = ['Services', 'Réalisations', 'Forfaits', 'Évaluation gratuite'];
  return (
    <header className="relative z-20">
      <div className="max-w-[1200px] mx-auto px-8 pt-7 pb-2 flex items-center justify-between">
        <a href="#" className="font-display text-3xl font-extrabold tracking-tight text-white">
          Signa<span className="text-brand">.</span>
        </a>
        <nav className="hidden md:flex items-center gap-9 text-[15px] text-white/85">
          {links.map((l) => (
            <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
          ))}
        </nav>
        <button
          onClick={onOpenForm}
          className="inline-flex items-center px-5 py-2.5 rounded-md bg-brand hover:bg-brand-600 transition-colors text-white text-[14px] font-semibold cursor-pointer"
        >
          Évaluation gratuite
        </button>
      </div>
    </header>
  );
};
