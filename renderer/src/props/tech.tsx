// Batch 3: tech, communication and success.
import { Ground, type PropArt } from "./kit";

export const Laptop: PropArt = ({ k }) => (
  <g>
    <Ground w={220} />
    <rect x={50} y={46} width={156} height={112} rx={12} fill={k.ink} />
    <rect x={60} y={56} width={136} height={92} rx={6} fill={k.sky} />
    <rect x={72} y={70} width={60} height={34} rx={6} fill={k.white} />
    <rect x={140} y={70} width={44} height={14} rx={7} fill={k.brand} />
    <rect x={140} y={92} width={30} height={12} rx={6} fill={k.white} opacity={0.8} />
    <rect x={72} y={114} width={112} height={22} rx={6} fill={k.white} opacity={0.6} />
    <path d="M24 170 H232 L220 196 H36 Z" fill={k.greyD} />
    <path d="M24 162 H232 V176 H24 Z" fill={k.grey} />
    <rect x={104} y={162} width={48} height={8} rx={4} fill={k.greyD} />
  </g>
);

export const Envelope: PropArt = ({ k }) => (
  <g>
    <Ground w={200} />
    <rect x={30} y={70} width={196} height={140} rx={14} fill={k.greyD} />
    <rect x={30} y={62} width={196} height={140} rx={14} fill={k.paper} />
    <path d="M36 196 L110 132 M220 196 L146 132" stroke={k.grey} strokeWidth={8} strokeLinecap="round" />
    <path d="M34 72 L128 142 L222 72" fill={k.white} stroke={k.grey} strokeWidth={8} strokeLinejoin="round" />
    <circle cx={128} cy={140} r={18} fill={k.red} />
  </g>
);

export const ChatBubble: PropArt = ({ k }) => (
  <g>
    <Ground w={170} />
    <path d="M62 44 H194 Q224 44 224 74 V140 Q224 170 194 170 H120 L74 210 L82 170 H62 Q32 170 32 140 V74 Q32 44 62 44 Z" fill={k.brandD} transform="translate(0 8)" />
    <path d="M62 44 H194 Q224 44 224 74 V140 Q224 170 194 170 H120 L74 210 L82 170 H62 Q32 170 32 140 V74 Q32 44 62 44 Z" fill={k.brand} />
    <circle cx={88} cy={108} r={14} fill={k.white} />
    <circle cx={128} cy={108} r={14} fill={k.white} />
    <circle cx={168} cy={108} r={14} fill={k.white} />
  </g>
);

export const ThumbsUp: PropArt = ({ k }) => (
  <g>
    <Ground w={170} />
    <rect x={36} y={112} width={46} height={110} rx={10} fill={k.brandD} />
    <rect x={36} y={106} width={46} height={110} rx={10} fill={k.brand} />
    <path d="M92 112 L130 40 Q144 20 158 36 Q166 48 160 70 L152 98 H200 Q222 98 220 122 L208 196 Q204 214 184 214 H92 Z" fill={k.skinD} transform="translate(0 6)" />
    <path d="M92 112 L130 40 Q144 20 158 36 Q166 48 160 70 L152 98 H200 Q222 98 220 122 L208 196 Q204 214 184 214 H92 Z" fill={k.skin} />
    <path d="M160 132 H212 M158 160 H206 M154 188 H200" stroke={k.skinD} strokeWidth={6} strokeLinecap="round" />
  </g>
);

export const Trophy: PropArt = ({ k }) => (
  <g>
    <Ground w={150} />
    <path d="M70 52 Q30 52 32 88 Q36 124 82 130" stroke={k.goldD} strokeWidth={16} fill="none" strokeLinecap="round" />
    <path d="M186 52 Q226 52 224 88 Q220 124 174 130" stroke={k.goldD} strokeWidth={16} fill="none" strokeLinecap="round" />
    <path d="M64 36 H192 V92 Q192 150 128 156 Q64 150 64 92 Z" fill={k.gold} />
    <path d="M64 92 Q64 150 128 156 Q192 150 192 92 Q170 132 128 134 Q86 132 64 92 Z" fill={k.goldD} />
    <rect x={112} y={154} width={32} height={36} fill={k.goldD} />
    <rect x={76} y={186} width={104} height={20} rx={6} fill={k.gold} />
    <rect x={64} y={204} width={128} height={26} rx={8} fill={k.wood} />
    <path d={"M128 62 l9 18 20 3 -14 14 3 20 -18 -9 -18 9 3 -20 -14 -14 20 -3 Z"} fill="#FFE38A" />
  </g>
);

export const Rocket: PropArt = ({ k }) => (
  <g>
    <Ground w={130} />
    <g transform="translate(128 124) scale(1.15) translate(-128 -124)">
    <path d="M110 196 Q128 248 146 196 Z" fill={k.orange} />
    <path d="M118 196 Q128 226 138 196 Z" fill={k.gold} />
    <path d="M90 150 L56 196 L96 186 Z" fill={k.redD} />
    <path d="M166 150 L200 196 L160 186 Z" fill={k.redD} />
    <path d="M128 18 Q176 56 172 140 L164 196 H92 L84 140 Q80 56 128 18 Z" fill={k.paper} />
    <path d="M128 18 Q152 38 164 66 H92 Q104 38 128 18 Z" fill={k.red} />
    <path d="M164 196 L172 140 Q176 110 170 88 Q160 150 150 196 Z" fill={k.grey} />
    <circle cx={128} cy={112} r={22} fill={k.blueD} />
    <circle cx={128} cy={112} r={14} fill={k.sky} />
    <rect x={112} y={182} width={32} height={20} rx={6} fill={k.inkSoft} />
    </g>
  </g>
);

export const Magnifier: PropArt = ({ k }) => (
  <g>
    <Ground w={170} />
    <rect x={150} y={148} width={36} height={92} rx={16} fill={k.inkSoft} transform="rotate(-45 168 194)" />
    <circle cx={108} cy={108} r={82} fill={k.inkSoft} />
    <circle cx={108} cy={108} r={64} fill={k.sky} />
    <path d="M70 84 Q84 58 112 54" stroke={k.white} strokeWidth={12} strokeLinecap="round" fill="none" opacity={0.85} />
  </g>
);

const gearPath = (() => {
  const teeth = 8, R = 100, r = 78, pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a0 = (Math.PI / teeth) * i - 0.16, a1 = (Math.PI / teeth) * i + 0.16, rad = i % 2 ? r : R;
    pts.push(`${i ? "L" : "M"}${(128 + Math.cos(a0) * rad).toFixed(1)} ${(128 + Math.sin(a0) * rad).toFixed(1)}`, `L${(128 + Math.cos(a1) * rad).toFixed(1)} ${(128 + Math.sin(a1) * rad).toFixed(1)}`);
  }
  return pts.join(" ") + " Z";
})();
export const Gear: PropArt = ({ k }) => (
  <g>
    <Ground w={170} />
    <path d={gearPath} fill={k.greyD} transform="translate(0 8)" strokeLinejoin="round" stroke={k.greyD} strokeWidth={10} />
    <path d={gearPath} fill={k.grey} strokeLinejoin="round" stroke={k.grey} strokeWidth={10} />
    <circle cx={128} cy={128} r={44} fill={k.brand} />
    <circle cx={128} cy={128} r={22} fill={k.paper} />
  </g>
);
