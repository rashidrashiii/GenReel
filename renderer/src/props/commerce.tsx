// Batch 2: shopping and money.
import { Ground, type PropArt } from "./kit";

export const Megaphone: PropArt = ({ k }) => (
  <g>
    <Ground w={170} />
    <rect x={64} y={150} width={26} height={60} rx={10} fill={k.inkSoft} transform="rotate(-14 77 150)" />
    <path d="M52 104 L150 52 L150 196 L52 150 Z" fill={k.brandD} />
    <path d="M52 100 L150 48 L150 182 L52 142 Z" fill={k.brand} />
    <rect x={30} y={98} width={36} height={52} rx={12} fill={k.inkSoft} />
    <ellipse cx={154} cy={118} rx={22} ry={72} fill={k.accent} />
    <ellipse cx={154} cy={118} rx={12} ry={52} fill={k.accentD} />
    <path d="M196 88 q 18 30 0 60 M214 70 q 30 48 0 96" stroke={k.accent} strokeWidth={10} strokeLinecap="round" fill="none" />
  </g>
);

export const Gift: PropArt = ({ k }) => (
  <g>
    <Ground w={190} />
    <rect x={44} y={110} width={168} height={118} rx={14} fill={k.brandD} />
    <rect x={44} y={110} width={168} height={104} rx={14} fill={k.brand} />
    <rect x={32} y={82} width={192} height={44} rx={12} fill={k.accent} />
    <rect x={32} y={112} width={192} height={14} fill={k.accentD} />
    <rect x={114} y={82} width={28} height={146} fill={k.gold} />
    <path d="M128 82 C 96 40 60 52 74 76 C 82 88 112 86 128 82 Z" fill={k.gold} />
    <path d="M128 82 C 160 40 196 52 182 76 C 174 88 144 86 128 82 Z" fill={k.gold} />
    <circle cx={128} cy={82} r={12} fill={k.goldD} />
  </g>
);

export const ShoppingCart: PropArt = ({ k }) => (
  <g>
    <Ground w={180} />
    <path d="M24 52 H62 L92 168 H200" stroke={k.inkSoft} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M66 74 H222 L204 148 H86 Z" fill={k.brand} />
    <path d="M86 148 H204 L208 132 H82 Z" fill={k.brandD} />
    {[100, 130, 160, 190].map((x) => <rect key={x} x={x} y={86} width={10} height={50} rx={5} fill={k.brandD} opacity={0.6} />)}
    <rect x={112} y={44} width={44} height={40} rx={8} fill={k.orange} />
    <rect x={150} y={36} width={40} height={48} rx={8} fill={k.green} />
    <circle cx={104} cy={200} r={18} fill={k.ink} /><circle cx={104} cy={200} r={7} fill={k.grey} />
    <circle cx={186} cy={200} r={18} fill={k.ink} /><circle cx={186} cy={200} r={7} fill={k.grey} />
  </g>
);

export const ShoppingBag: PropArt = ({ k }) => (
  <g>
    <Ground w={160} />
    <path d="M92 86 C 92 34 164 34 164 86" stroke={k.accentD} strokeWidth={14} strokeLinecap="round" fill="none" />
    <path d="M52 80 H204 L216 226 H40 Z" fill={k.brandD} />
    <path d="M52 80 H204 L212 210 H44 Z" fill={k.brand} />
    <circle cx={92} cy={102} r={8} fill={k.brandD} /><circle cx={164} cy={102} r={8} fill={k.brandD} />
    <path d="M92 102 C 92 150 164 150 164 102" stroke={k.white} strokeWidth={10} strokeLinecap="round" fill="none" />
    <rect x={52} y={80} width={152} height={14} fill={k.accent} />
  </g>
);

export const PriceTag: PropArt = ({ k }) => (
  <g>
    <Ground w={170} />
    <g transform="rotate(-30 128 128)">
      <path d="M56 70 H170 L220 128 L170 186 H56 Q40 186 40 170 V86 Q40 70 56 70 Z" fill={k.accentD} transform="translate(0 10)" />
      <path d="M56 70 H170 L220 128 L170 186 H56 Q40 186 40 170 V86 Q40 70 56 70 Z" fill={k.accent} />
      <circle cx={176} cy={128} r={14} fill={k.paper} />
      <rect x={66} y={104} width={80} height={14} rx={7} fill={k.white} />
      <rect x={66} y={132} width={52} height={14} rx={7} fill={k.white} opacity={0.8} />
    </g>
    <path d="M194 90 C 214 60 236 54 240 30" stroke={k.inkSoft} strokeWidth={6} strokeLinecap="round" fill="none" />
  </g>
);

/** ₹ drawn as shapes (no text). */
const Rupee = ({ c }: { c: string }) => (
  <g stroke={c} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <path d="M96 84 H160 M96 108 H160" />
    <path d="M100 84 H118 C 150 84 150 132 118 132 H100 L150 182" />
  </g>
);

export const RupeeCoin: PropArt = ({ k }) => (
  <g>
    <Ground w={170} />
    <circle cx={128} cy={136} r={96} fill={k.goldD} />
    <circle cx={128} cy={126} r={96} fill={k.gold} />
    <circle cx={128} cy={126} r={76} fill="#F9CB54" />
    <g transform="translate(0 -2)"><Rupee c={k.goldD} /></g>
  </g>
);

export const MoneyStack: PropArt = ({ k }) => (
  <g>
    <Ground w={200} />
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${i * 6} ${-i * 34})`}>
        <rect x={30} y={170} width={190} height={44} rx={8} fill={k.greenD} />
        <rect x={30} y={164} width={190} height={40} rx={8} fill={k.green} />
        <rect x={104} y={164} width={42} height={40} fill={k.leaf} />
        <circle cx={125} cy={184} r={12} fill={k.greenD} />
      </g>
    ))}
    <g transform="translate(150 70)">
      <circle r={40} fill={k.goldD} cy={6} /><circle r={40} fill={k.gold} />
      <g transform="translate(-128 -130) scale(1)"><g transform="translate(128 130) scale(0.5) translate(-128 -130)"><Rupee c={k.goldD} /></g></g>
    </g>
  </g>
);

export const Phone: PropArt = ({ k }) => (
  <g>
    <Ground w={130} />
    <rect x={70} y={22} width={116} height={212} rx={24} fill={k.ink} />
    <rect x={70} y={18} width={116} height={206} rx={24} fill={k.inkSoft} />
    <rect x={80} y={40} width={96} height={164} rx={10} fill={k.sky} />
    <rect x={110} y={28} width={36} height={6} rx={3} fill={k.ink} />
    <rect x={92} y={56} width={72} height={36} rx={8} fill={k.white} />
    <rect x={92} y={102} width={50} height={14} rx={7} fill={k.white} />
    <rect x={92} y={124} width={66} height={14} rx={7} fill={k.white} opacity={0.8} />
    <rect x={92} y={160} width={72} height={30} rx={15} fill={k.brand} />
    <circle cx={128} cy={214} r={6} fill={k.ink} />
  </g>
);
