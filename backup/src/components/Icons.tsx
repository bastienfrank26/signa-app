type IconProps = { className?: string };

const ArrowRight = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" />
    <path d="m13 5 7 7-7 7" />
  </svg>
);

const Bolt = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
  </svg>
);

const Dollar = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v20" />
    <path d="M17 6.5C16 5 14.2 4 12 4c-2.8 0-5 1.6-5 4s2.2 3.5 5 4 5 1.6 5 4-2.2 4-5 4c-2.2 0-4-1-5-2.5" />
  </svg>
);

const Monitor = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2.5" y="3.5" width="19" height="13" rx="2" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
  </svg>
);

const Check = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m5 12 5 5L20 7" />
  </svg>
);

const Maple = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2 13 6l3-2-1 4 4 0-3 3 4 2-5 1 1 4-4-2-1 4-1-4-4 2 1-4-5-1 4-2-3-3 4 0-1-4 3 2L12 2z" />
  </svg>
);

const House = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M3 11 12 4l9 7" strokeLinejoin="round" />
    <path d="M5 10v9h14v-9" />
    <path d="M10 19v-5h4v5" />
  </svg>
);

const Garage = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M3 10 12 4l9 6v10H3z" strokeLinejoin="round" />
    <path d="M6 13h12M6 16h12M6 19h12" />
  </svg>
);

const Leaf = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M4 20c0-9 7-16 16-16-1 9-7 16-16 16Z" strokeLinejoin="round" />
    <path d="M4 20 14 10" />
  </svg>
);

const Truck = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M2 7h11v9H2zM13 10h5l3 3v3h-8z" strokeLinejoin="round" />
    <circle cx="6.5" cy="17.5" r="1.8" />
    <circle cx="17.5" cy="17.5" r="1.8" />
  </svg>
);

const Hammer = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="m14 6 4 4-9 9-4-4z" strokeLinejoin="round" />
    <path d="m13 7 4-4 4 4-4 4" strokeLinejoin="round" />
  </svg>
);

const Wrench = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className={className}>
    <path d="M15 3a5 5 0 0 0-4.6 6.9L3 17.3 6.7 21l7.4-7.4A5 5 0 1 0 15 3Z" />
  </svg>
);

export const Icons = {
  ArrowRight,
  Bolt,
  Dollar,
  Monitor,
  Check,
  Maple,
  House,
  Garage,
  Leaf,
  Truck,
  Hammer,
  Wrench,
};
