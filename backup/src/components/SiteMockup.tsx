type MockupProps = {
  brand: string;
  title?: string;
  cta?: string;
  variant?: 'modern' | 'legacy';
  className?: string;
  photoLabel?: string;
};

export const SiteMockup = ({
  brand,
  title,
  cta = 'Demander une soumission',
  variant = 'modern',
  className = '',
  photoLabel = 'photo client',
}: MockupProps) => {
  const legacy = variant === 'legacy';
  return (
    <div className={`relative overflow-hidden rounded-xl ${legacy ? 'bg-[#d9d2c2]' : 'bg-ink-800'} shadow-card ${className}`}>
      {/* Title bar */}
      <div className={`flex items-center gap-1.5 px-3 py-2 ${legacy ? 'bg-[#c9c2b1]' : 'bg-ink-700/80'}`}>
        <span className="block w-2.5 h-2.5 rounded-full bg-red-400/80"></span>
        <span className="block w-2.5 h-2.5 rounded-full bg-amber-300/80"></span>
        <span className="block w-2.5 h-2.5 rounded-full bg-emerald-400/80"></span>
      </div>

      {/* Top nav */}
      <div className={`flex items-center justify-between px-4 py-2 text-[10px] ${legacy ? 'text-[#3a3528] bg-[#e9e1cf]' : 'text-white/90 bg-ink-700/40'}`}>
        <div className="flex items-center gap-1.5">
          <span className={`inline-block w-3 h-3 rounded-sm ${legacy ? 'bg-[#b87830]' : 'bg-brand'}`}></span>
          <span className="font-semibold tracking-wide uppercase">{brand}</span>
        </div>
        <div className="flex items-center gap-3 opacity-80">
          <span>Accueil</span><span>Services</span><span>Réalisations</span><span>Contact</span>
          {!legacy && (
            <span className="ml-1 inline-block px-2 py-0.5 rounded bg-brand text-white text-[9px] font-semibold">
              Soumission
            </span>
          )}
        </div>
      </div>

      {/* Hero photo + copy */}
      <div className="relative aspect-[16/10]">
        <div className={`absolute inset-0 ${legacy ? 'placeholder-stripes-light' : 'placeholder-stripes'}`}></div>
        {!legacy && (
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/30 to-ink-900/10"></div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-[9px] uppercase tracking-[0.25em] ${legacy ? 'text-[#5a4f3a]' : 'text-white/40'}`}>
            {photoLabel}
          </span>
        </div>
        <div className="absolute inset-0 p-4 flex flex-col justify-center">
          <div className={`max-w-[55%] ${legacy ? 'text-[#2a2519]' : 'text-white'}`}>
            <div className={`text-[13px] leading-tight font-display font-bold mb-2 ${legacy ? 'blur-[1.5px] opacity-80' : ''}`}>
              {title || 'Excavation\nrésidentielle\net commerciale'}
            </div>
            <div className={`text-[7px] leading-tight max-w-[80%] mb-2.5 ${legacy ? 'opacity-70' : 'opacity-80'}`}>
              {legacy
                ? '— ipsum dolor sit amet consectetur adipiscing elit sed do eius —'
                : 'Service rapide, équipe locale et soumission sans frais partout dans la région.'}
            </div>
            <span className={`inline-block px-2.5 py-1 rounded-md text-[8px] font-semibold ${legacy ? 'bg-[#b87830] text-white/90' : 'bg-brand text-white'}`}>
              {cta}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
