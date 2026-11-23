// Batch 1: symbols. Each draws in 0..256 with the shared ground shadow.
import { Ground, type PropArt } from "./kit";

export const Checkmark: PropArt = ({ k }) => (
  <g>
    <Ground />
    <circle cx={128} cy={128} r={100} fill={k.greenD} />
    <circle cx={128} cy={120} r={100} fill={k.green} />
    <path d="M80 122 L114 156 L180 88" stroke={k.white} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </g>
);

export const Cross: PropArt = ({ k }) => (
  <g>
    <Ground />
    <circle cx={128} cy={128} r={100} fill={k.redD} />
    <circle cx={128} cy={120} r={100} fill={k.red} />
    <path d="M88 80 L168 160 M168 80 L88 160" stroke={k.white} strokeWidth={26} strokeLinecap="round" />
  </g>
);

const starPath = (cx: number, cy: number, R: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2, rad = i % 2 ? r : R;
    return `${i ? "L" : "M"}${(cx + Math.cos(a) * rad).toFixed(1)} ${(cy + Math.sin(a) * rad).toFixed(1)}`;
  }).join(" ") + " Z";

export const Star: PropArt = ({ k }) => (
  <g>
    <Ground w={170} />
    <path d={starPath(128, 140, 112, 50)} fill={k.goldD} strokeLinejoin="round" stroke={k.goldD} strokeWidth={14} />
    <path d={starPath(128, 130, 112, 50)} fill={k.gold} strokeLinejoin="round" stroke={k.gold} strokeWidth={14} />
    <path d={starPath(128, 130, 52, 24)} fill="#FFD966" />
  </g>
);

const heart = "M128 214 C 60 168 28 132 28 92 C 28 58 54 34 86 34 C 106 34 120 46 128 62 C 136 46 150 34 170 34 C 202 34 228 58 228 92 C 228 132 196 168 128 214 Z";
export const Heart: PropArt = ({ k }) => (
  <g>
    <Ground w={150} />
    <path d={heart} transform="translate(0 10)" fill={k.redD} />
    <path d={heart} fill={k.red} />
    <ellipse cx={80} cy={84} rx={20} ry={14} fill="#FFFFFF" opacity={0.45} transform="rotate(-30 80 84)" />
  </g>
);

export const Lightbulb: PropArt = ({ k }) => (
  <g>
    <Ground w={110} />
    <path d="M128 22 C 74 22 44 62 44 104 C 44 136 62 154 80 172 L 176 172 C 194 154 212 136 212 104 C 212 62 182 22 128 22 Z" fill={k.gold} />
    <path d="M80 172 C 70 162 62 152 56 140 L 200 140 C 194 152 186 162 176 172 Z" fill={k.goldD} />
    <path d="M106 116 Q 118 100 128 120 Q 138 100 150 116 L 140 170 M 116 170 L 106 116" stroke="#FFF3C4" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x={84} y={172} width={88} height={22} rx={8} fill={k.greyD} />
    <rect x={88} y={194} width={80} height={20} rx={8} fill={k.grey} />
    <rect x={102} y={214} width={52} height={16} rx={8} fill={k.inkSoft} />
    <ellipse cx={92} cy={74} rx={16} ry={24} fill="#FFFFFF" opacity={0.5} transform="rotate(30 92 74)" />
  </g>
);

export const Clock: PropArt = ({ k }) => (
  <g>
    <Ground />
    <circle cx={128} cy={132} r={104} fill={k.brandD} />
    <circle cx={128} cy={124} r={104} fill={k.brand} />
    <circle cx={128} cy={124} r={82} fill={k.white} />
    {Array.from({ length: 12 }, (_, i) => (
      <rect key={i} x={124} y={50} width={8} height={i % 3 ? 10 : 18} rx={4} fill={k.inkSoft} transform={`rotate(${i * 30} 128 124)`} />
    ))}
    <path d="M128 124 L128 74" stroke={k.ink} strokeWidth={12} strokeLinecap="round" />
    <path d="M128 124 L166 140" stroke={k.ink} strokeWidth={10} strokeLinecap="round" />
    <circle cx={128} cy={124} r={10} fill={k.accent} />
  </g>
);

export const Calendar: PropArt = ({ k }) => (
  <g>
    <Ground w={180} />
    <rect x={34} y={52} width={188} height={176} rx={22} fill={k.greyD} />
    <rect x={34} y={44} width={188} height={176} rx={22} fill={k.white} />
    <path d="M34 66 Q34 44 56 44 H200 Q222 44 222 66 V96 H34 Z" fill={k.red} />
    <rect x={74} y={24} width={18} height={44} rx={9} fill={k.inkSoft} />
    <rect x={164} y={24} width={18} height={44} rx={9} fill={k.inkSoft} />
    {Array.from({ length: 9 }, (_, i) => (
      <rect key={i} x={56 + (i % 3) * 52} y={112 + Math.floor(i / 3) * 34} width={40} height={24} rx={6} fill={i === 4 ? k.brand : k.grey} />
    ))}
  </g>
);

export const LocationPin: PropArt = ({ k }) => (
  <g>
    <ellipse cx={128} cy={232} rx={60} ry={14} fill="#000" opacity={0.14} />
    <ellipse cx={128} cy={232} rx={26} ry={7} fill="#000" opacity={0.18} />
    <path d="M128 232 C 100 190 48 150 48 100 C 48 54 84 22 128 22 C 172 22 208 54 208 100 C 208 150 156 190 128 232 Z" fill={k.redD} />
    <path d="M128 222 C 102 182 56 146 56 100 C 56 58 88 30 128 30 C 168 30 200 58 200 100 C 200 146 154 182 128 222 Z" fill={k.red} />
    <circle cx={128} cy={98} r={34} fill={k.white} />
  </g>
);
