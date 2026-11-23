// Batch 4: places, nature, transport, data.
import { Ground, type PropArt } from "./kit";

export const House: PropArt = ({ k }) => (
  <g>
    <Ground w={200} />
    <rect x={52} y={110} width={152} height={120} rx={8} fill={k.paper} />
    <rect x={52} y={204} width={152} height={26} fill={k.grey} />
    <path d="M28 120 L128 34 L228 120 Q232 132 220 132 H36 Q24 132 28 120 Z" fill={k.redD} />
    <path d="M28 112 L128 26 L228 112 Q232 124 220 124 H36 Q24 124 28 112 Z" fill={k.red} />
    <rect x={160} y={42} width={24} height={46} rx={4} fill={k.woodD} />
    <rect x={110} y={156} width={40} height={74} rx={8} fill={k.wood} />
    <circle cx={140} cy={196} r={4} fill={k.gold} />
    <rect x={68} y={146} width={32} height={32} rx={6} fill={k.sky} />
    <rect x={164} y={146} width={28} height={32} rx={6} fill={k.sky} />
  </g>
);

export const ShopFront: PropArt = ({ k }) => (
  <g>
    <Ground w={220} />
    <rect x={34} y={70} width={188} height={160} rx={8} fill={k.paper} />
    <rect x={34} y={206} width={188} height={24} fill={k.grey} />
    <rect x={34} y={40} width={188} height={34} rx={8} fill={k.brandD} />
    {Array.from({ length: 6 }, (_, i) => (
      <path key={i} d={`M${34 + i * 31.33} 74 h31.33 v20 q-15.66 20 -31.33 0 z`} fill={i % 2 ? k.white : k.brand} />
    ))}
    <rect x={48} y={116} width={86} height={70} rx={6} fill={k.sky} />
    <rect x={56} y={160} width={24} height={26} rx={4} fill={k.orange} /><rect x={86} y={150} width={20} height={36} rx={4} fill={k.green} /><rect x={110} y={164} width={18} height={22} rx={4} fill={k.red} />
    <rect x={146} y={116} width={62} height={114} rx={6} fill={k.wood} />
    <circle cx={196} cy={174} r={5} fill={k.gold} />
  </g>
);

export const Tree: PropArt = ({ k }) => (
  <g>
    <Ground w={140} />
    <path d="M116 150 H140 L146 232 H110 Z" fill={k.woodD} />
    <path d="M118 150 H136 L140 228 H114 Z" fill={k.wood} />
    <circle cx={128} cy={86} r={66} fill={k.greenD} />
    <circle cx={84} cy={124} r={48} fill={k.greenD} />
    <circle cx={172} cy={124} r={48} fill={k.greenD} />
    <circle cx={128} cy={78} r={60} fill={k.leaf} />
    <circle cx={86} cy={116} r={42} fill={k.leaf} />
    <circle cx={170} cy={116} r={42} fill={k.green} />
    <circle cx={104} cy={64} r={14} fill="#8ED081" />
  </g>
);

export const Sun: PropArt = ({ k }) => (
  <g>
    {Array.from({ length: 12 }, (_, i) => (
      <rect key={i} x={120} y={8} width={16} height={40} rx={8} fill={k.orange} transform={`rotate(${i * 30} 128 128)`} />
    ))}
    <circle cx={128} cy={134} r={70} fill={k.goldD} />
    <circle cx={128} cy={128} r={70} fill={k.gold} />
    <circle cx={104} cy={104} r={16} fill="#FFE38A" />
  </g>
);

export const Cloud: PropArt = ({ k }) => (
  <g>
    <Ground w={170} y={212} />
    <g transform="translate(0 10)" fill={k.greyD}>
      <rect x={34} y={120} width={188} height={68} rx={34} /><circle cx={98} cy={118} r={44} /><circle cx={154} cy={104} r={56} />
    </g>
    <g fill={k.white}>
      <rect x={34} y={120} width={188} height={64} rx={32} /><circle cx={98} cy={118} r={44} /><circle cx={154} cy={104} r={56} />
    </g>
  </g>
);

export const WaterDrop: PropArt = ({ k }) => (
  <g>
    <Ground w={130} />
    <path d="M128 22 C 160 76 196 116 196 158 C 196 198 166 226 128 226 C 90 226 60 198 60 158 C 60 116 96 76 128 22 Z" fill={k.blueD} />
    <path d="M128 22 C 158 74 190 112 190 152 C 190 190 162 216 128 216 C 94 216 66 190 66 152 C 66 112 98 74 128 22 Z" fill={k.blue} />
    <path d="M96 150 Q96 122 116 104" stroke="#BFE3FF" strokeWidth={12} strokeLinecap="round" fill="none" />
  </g>
);

/** A modern metro/train, side view (original: rounded cab, two cars). */
export const Train: PropArt = ({ k }) => (
  <g>
    <rect x={8} y={214} width={240} height={10} rx={5} fill={k.inkSoft} />
    <path d="M14 82 H196 Q240 82 246 150 V182 Q246 198 230 198 H14 Z" fill={k.brandD} />
    <path d="M14 76 H196 Q238 76 244 144 V172 Q244 188 228 188 H14 Z" fill={k.paper} />
    <rect x={14} y={150} width={230} height={16} fill={k.brand} />
    {[30, 82, 134].map((x) => <rect key={x} x={x} y={98} width={40} height={36} rx={8} fill={k.sky} />)}
    <path d="M190 98 H206 Q228 100 234 136 H190 Z" fill={k.sky} />
    <rect x={14} y={76} width={6} height={112} fill={k.greyD} />
    {[44, 104, 172, 214].map((x) => <g key={x}><circle cx={x} cy={204} r={14} fill={k.ink} /><circle cx={x} cy={204} r={5} fill={k.grey} /></g>)}
    <circle cx={236} cy={170} r={6} fill={k.gold} />
  </g>
);

export const BarChart: PropArt = ({ k }) => (
  <g>
    <Ground w={200} />
    <rect x={30} y={226} width={196} height={8} rx={4} fill={k.inkSoft} />
    {[[46, 140], [92, 104], [138, 70], [184, 30]].map(([x, top], i) => (
      <g key={i}>
        <rect x={x} y={top! + 8} width={34} height={226 - top! - 8} rx={8} fill={i === 3 ? k.accentD : k.brandD} />
        <rect x={x} y={top} width={34} height={218 - top!} rx={8} fill={i === 3 ? k.accent : k.brand} />
      </g>
    ))}
    <path d="M58 120 L104 88 L150 56 L196 20" stroke={k.orange} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M182 16 L202 14 L198 34" stroke={k.orange} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </g>
);
