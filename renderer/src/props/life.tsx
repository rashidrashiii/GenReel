// Tier 2, batch C: work, health and learning.
import { Ground, type PropArt } from "./kit";

export const ChefHat: PropArt = ({ k }) => (
  <g>
    <Ground w={150} />
    <rect x={70} y={150} width={116} height={70} rx={10} fill={k.grey} />
    <rect x={70} y={144} width={116} height={68} rx={10} fill={k.white} />
    <path d="M88 160 V200 M128 160 V200 M168 160 V200" stroke={k.grey} strokeWidth={5} strokeLinecap="round" />
    <circle cx={80} cy={112} r={44} fill={k.white} />
    <circle cx={176} cy={112} r={44} fill={k.white} />
    <circle cx={128} cy={84} r={56} fill={k.white} />
    <path d="M70 150 Q128 136 186 150" stroke={k.grey} strokeWidth={5} fill="none" />
  </g>
);

export const Tooth: PropArt = ({ k }) => (
  <g>
    <Ground w={130} />
    <path d="M60 64 Q60 28 98 30 Q114 32 128 42 Q142 32 158 30 Q196 28 196 64 Q196 104 182 140 L170 212 Q166 228 154 214 L140 160 Q128 146 116 160 L102 214 Q90 228 86 212 L74 140 Q60 104 60 64 Z" fill={k.grey} transform="translate(0 6)" />
    <path d="M60 64 Q60 28 98 30 Q114 32 128 42 Q142 32 158 30 Q196 28 196 64 Q196 104 182 140 L170 212 Q166 228 154 214 L140 160 Q128 146 116 160 L102 214 Q90 228 86 212 L74 140 Q60 104 60 64 Z" fill={k.white} />
    <path d="M84 58 Q90 46 104 46" stroke={k.sky} strokeWidth={10} strokeLinecap="round" fill="none" />
  </g>
);

export const Stethoscope: PropArt = ({ k }) => (
  <g>
    <Ground w={160} />
    <path d="M74 36 V100 Q74 150 120 150 Q166 150 166 100 V36" stroke={k.greyD} strokeWidth={12} fill="none" strokeLinecap="round" />
    <circle cx={74} cy={34} r={10} fill={k.grey} /><circle cx={166} cy={34} r={10} fill={k.grey} />
    <path d="M120 150 V178 Q120 214 160 214 Q192 214 192 182" stroke={k.greyD} strokeWidth={12} fill="none" strokeLinecap="round" />
    <circle cx={192} cy={168} r={30} fill={k.greyD} />
    <circle cx={192} cy={164} r={30} fill={k.grey} />
    <circle cx={192} cy={164} r={16} fill={k.brand} />
  </g>
);

export const Pill: PropArt = ({ k }) => (
  <g>
    <Ground w={170} />
    <g transform="rotate(-35 128 128)">
      <rect x={34} y={92} width={188} height={84} rx={42} fill={k.redD} />
      <rect x={34} y={86} width={188} height={84} rx={42} fill={k.white} />
      <path d="M128 86 H180 Q222 86 222 128 Q222 170 180 170 H128 Z" fill={k.red} />
      <rect x={58} y={102} width={50} height={14} rx={7} fill={k.grey} opacity={0.6} />
    </g>
  </g>
);

export const Book: PropArt = ({ k }) => (
  <g>
    <Ground w={200} />
    <path d="M128 70 Q90 46 30 54 V202 Q90 194 128 216 Z" fill={k.brandD} />
    <path d="M128 70 Q166 46 226 54 V202 Q166 194 128 216 Z" fill={k.brandD} />
    <path d="M128 66 Q92 44 40 50 V194 Q92 188 128 208 Z" fill={k.paper} />
    <path d="M128 66 Q164 44 216 50 V194 Q164 188 128 208 Z" fill={k.white} />
    {[80, 104, 128, 152].map((y) => <path key={y} d={`M58 ${y} Q90 ${y - 4} 114 ${y + 6}`} stroke={k.grey} strokeWidth={6} strokeLinecap="round" fill="none" />)}
    {[80, 104, 128].map((y) => <path key={y} d={`M142 ${y + 6} Q166 ${y - 4} 198 ${y}`} stroke={k.grey} strokeWidth={6} strokeLinecap="round" fill="none" />)}
    <path d="M176 50 V96 L188 86 L200 96 V50" fill={k.red} />
  </g>
);

export const GraduationCap: PropArt = ({ k }) => (
  <g>
    <Ground w={180} />
    <path d="M72 120 V176 Q128 210 184 176 V120 Z" fill={k.ink} />
    <path d="M128 52 L238 100 L128 148 L18 100 Z" fill={k.inkSoft} transform="translate(0 6)" />
    <path d="M128 52 L238 100 L128 148 L18 100 Z" fill={k.ink} />
    <path d="M128 100 L206 112 V170" stroke={k.gold} strokeWidth={6} fill="none" strokeLinecap="round" />
    <path d="M196 168 h20 l6 34 h-32 z" fill={k.gold} />
    <circle cx={128} cy={100} r={9} fill={k.gold} />
  </g>
);

export const Pencil: PropArt = ({ k }) => (
  <g>
    <Ground w={160} />
    <g transform="rotate(-40 128 128)">
      <rect x={30} y={102} width={156} height={52} rx={6} fill={k.gold} />
      <rect x={30} y={102} width={156} height={17} fill="#F9CB54" />
      <rect x={30} y={137} width={156} height={17} fill={k.goldD} />
      <rect x={14} y={102} width={22} height={52} rx={8} fill="#F48FB1" />
      <rect x={30} y={102} width={14} height={52} fill={k.grey} />
      <path d="M186 102 L232 128 L186 154 Z" fill="#F2D3A6" />
      <path d="M218 120 L232 128 L218 136 Z" fill={k.ink} />
    </g>
  </g>
);

export const Dumbbell: PropArt = ({ k }) => (
  <g>
    <Ground w={210} />
    <rect x={64} y={120} width={128} height={18} rx={9} fill={k.greyD} />
    {[[30, 34, 88], [60, 24, 112], [168, 24, 112], [192, 34, 88]].map(([x, w, h], i) => (
      <g key={i}><rect x={x} y={129 - (h as number) / 2 + 4} width={w} height={h} rx={10} fill={k.ink} /><rect x={x} y={129 - (h as number) / 2} width={w} height={h} rx={10} fill={i % 3 ? k.brand : k.inkSoft} /></g>
    ))}
  </g>
);
