// Tier 2, batch B: nature details, festival and food.
import { Ground, type PropArt } from "./kit";

export const Leaf: PropArt = ({ k }) => (
  <g>
    <Ground w={130} />
    <path d="M128 230 Q118 190 128 150" stroke={k.woodD} strokeWidth={10} strokeLinecap="round" fill="none" />
    <path d="M128 168 C 40 150 40 50 128 22 C 216 50 216 150 128 168 Z" fill={k.greenD} transform="translate(0 6)" />
    <path d="M128 168 C 40 150 40 50 128 22 C 216 50 216 150 128 168 Z" fill={k.leaf} />
    <path d="M128 160 V40 M128 120 L96 96 M128 120 L160 96 M128 86 L104 66 M128 86 L152 66" stroke={k.green} strokeWidth={6} strokeLinecap="round" fill="none" />
  </g>
);

export const Flower: PropArt = ({ k }) => (
  <g>
    <Ground w={120} />
    <path d="M128 232 Q124 180 128 140" stroke={k.greenD} strokeWidth={10} strokeLinecap="round" fill="none" />
    <path d="M128 200 Q96 170 80 186 Q100 206 128 200 Z" fill={k.leaf} />
    {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx={128} cy={58} rx={22} ry={40} fill={i % 2 ? "#F48FB1" : "#EC6F9E"} transform={`rotate(${i * 45} 128 96)`} />)}
    <circle cx={128} cy={96} r={26} fill={k.gold} />
    <circle cx={120} cy={88} r={7} fill="#FFE38A" />
  </g>
);

export const CoconutTree: PropArt = ({ k }) => (
  <g>
    <Ground w={150} />
    <path d="M118 234 Q132 160 112 84 L128 82 Q150 160 140 234 Z" fill={k.wood} />
    {[100, 130, 160, 190].map((y) => <path key={y} d={`M${116 + (y - 100) * 0.1} ${y} h22`} stroke={k.woodD} strokeWidth={5} strokeLinecap="round" />)}
    {[[-150, 1], [-110, 0.9], [-60, 1], [-20, 0.95], [20, 1], [-180, 0.8]].map(([a, s], i) => (
      <path key={i} d="M0 0 C 30 -10 70 0 100 30 C 70 18 30 12 0 8 Z" fill={i % 2 ? k.green : k.leaf} transform={`translate(120 84) rotate(${a}) scale(${s})`} />
    ))}
    <circle cx={112} cy={96} r={12} fill={k.woodD} /><circle cx={130} cy={100} r={12} fill={k.woodD} /><circle cx={120} cy={110} r={11} fill={k.wood} />
  </g>
);

/** Brass standing lamp (nilavilakku style) with three flames. */
export const OilLamp: PropArt = ({ k }) => (
  <g>
    <Ground w={150} />
    <path d="M70 228 Q72 206 128 204 Q184 206 186 228 Z" fill={k.goldD} />
    <rect x={118} y={96} width={20} height={112} rx={8} fill={k.gold} />
    <ellipse cx={128} cy={150} rx={22} ry={10} fill={k.goldD} />
    <path d="M70 92 Q128 130 186 92 Z" fill={k.goldD} />
    <path d="M66 88 H190 Q186 100 128 104 Q70 100 66 88 Z" fill={k.gold} />
    <path d="M128 40 L138 66 H118 Z" fill={k.gold} />
    {[84, 128, 172].map((x, i) => (
      <g key={x}>
        <path d={`M${x} ${i === 1 ? 30 : 46} C ${x + 14} ${i === 1 ? 52 : 66} ${x + 10} 82 ${x} 84 C ${x - 10} 82 ${x - 14} ${i === 1 ? 52 : 66} ${x} ${i === 1 ? 30 : 46} Z`} fill={k.orange} />
        <path d={`M${x} ${i === 1 ? 52 : 62} C ${x + 6} 70 ${x + 5} 80 ${x} 82 C ${x - 5} 80 ${x - 6} 70 ${x} ${i === 1 ? 52 : 62} Z`} fill={k.gold} />
      </g>
    ))}
  </g>
);

export const Bread: PropArt = ({ k }) => (
  <g>
    <Ground w={200} />
    <path d="M30 150 Q30 86 128 80 Q226 86 226 150 L218 200 Q216 214 200 214 H56 Q40 214 38 200 Z" fill="#B9763A" transform="translate(0 6)" />
    <path d="M30 150 Q30 86 128 80 Q226 86 226 150 L218 196 Q216 210 200 210 H56 Q40 210 38 196 Z" fill="#E0A15A" />
    <path d="M38 150 Q40 104 128 98 Q216 104 218 150 Q200 128 128 126 Q56 128 38 150 Z" fill="#C9833F" />
    {[80, 128, 176].map((x) => <path key={x} d={`M${x - 16} 120 Q${x} 104 ${x + 16} 116`} stroke="#F5C987" strokeWidth={8} strokeLinecap="round" fill="none" />)}
  </g>
);

export const Cake: PropArt = ({ k }) => (
  <g>
    <Ground w={200} />
    <rect x={40} y={110} width={176} height={110} rx={16} fill="#F7D4C7" />
    <rect x={40} y={160} width={176} height={14} fill="#E99BA5" />
    <path d="M40 126 Q40 104 64 104 H192 Q216 104 216 126 V136 Q204 150 192 136 Q180 150 168 136 Q156 150 144 136 Q132 150 120 136 Q108 150 96 136 Q84 150 72 136 Q60 150 52 136 Q44 146 40 136 Z" fill="#FFFFFF" />
    <rect x={40} y={206} width={176} height={14} rx={7} fill="#E3B3A5" />
    {[96, 128, 160].map((x, i) => (
      <g key={x}><rect x={x - 5} y={66} width={10} height={40} rx={4} fill={i === 1 ? k.accent : k.brand} /><path d={`M${x} 44 Q${x + 9} 56 ${x} 64 Q${x - 9} 56 ${x} 44 Z`} fill={k.orange} /></g>
    ))}
    {[66, 112, 160, 196].map((x) => <circle key={x} cx={x} cy={186} r={6} fill={k.red} />)}
  </g>
);

export const CoffeeCup: PropArt = ({ k }) => (
  <g>
    <Ground w={190} />
    <ellipse cx={120} cy={214} rx={92} ry={16} fill={k.grey} />
    <path d="M178 120 Q222 120 220 152 Q218 184 176 182" stroke={k.white} strokeWidth={16} fill="none" />
    <path d="M52 100 H188 L176 196 Q174 210 158 210 H82 Q66 210 64 196 Z" fill={k.greyD} transform="translate(0 4)" />
    <path d="M52 100 H188 L176 196 Q174 210 158 210 H82 Q66 210 64 196 Z" fill={k.white} />
    <ellipse cx={120} cy={102} rx={68} ry={14} fill="#7A4A2A" />
    <rect x={70} y={138} width={100} height={20} rx={10} fill={k.brand} />
    {[96, 124, 152].map((x, i) => <path key={x} d={`M${x} 82 q -12 -16 0 -32 q 12 -16 0 -30`} stroke={k.grey} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.8 - i * 0.1} />)}
  </g>
);

export const PlateFood: PropArt = ({ k }) => (
  <g>
    <Ground w={220} />
    <ellipse cx={128} cy={160} rx={110} ry={56} fill={k.greyD} />
    <ellipse cx={128} cy={152} rx={110} ry={56} fill={k.white} />
    <ellipse cx={128} cy={152} rx={84} ry={40} fill={k.paper} />
    <path d="M58 150 Q60 120 100 118 Q130 120 132 150 Q100 166 58 150 Z" fill="#FFFFFF" stroke={k.grey} strokeWidth={4} />
    <ellipse cx={162} cy={140} rx={30} ry={18} fill={k.orange} />
    <ellipse cx={156} cy={172} rx={26} ry={12} fill={k.leaf} />
    <ellipse cx={104} cy={174} rx={22} ry={10} fill={k.red} />
    <circle cx={90} cy={134} r={5} fill={k.gold} /><circle cx={106} cy={130} r={5} fill={k.gold} />
  </g>
);
