// Tier 2, batch A: transport and energy (side views, original designs).
import { Ground, type PropArt } from "./kit";

const Wheel = ({ x, y, r = 18, k }: { x: number; y: number; r?: number; k: { ink: string; grey: string } }) => (
  <g><circle cx={x} cy={y} r={r} fill={k.ink} /><circle cx={x} cy={y} r={r * 0.42} fill={k.grey} /></g>
);

export const Bus: PropArt = ({ k }) => (
  <g>
    <Ground w={220} />
    <rect x={20} y={70} width={216} height={130} rx={22} fill={k.redD} />
    <rect x={20} y={64} width={216} height={124} rx={22} fill={k.red} />
    <rect x={20} y={150} width={216} height={14} fill={k.paper} />
    {[34, 80, 126, 172].map((x) => <rect key={x} x={x} y={84} width={38} height={48} rx={8} fill={k.sky} />)}
    <rect x={212} y={84} width={18} height={70} rx={6} fill={k.sky} />
    <rect x={30} y={52} width={196} height={16} rx={8} fill={k.inkSoft} />
    <Wheel x={66} y={198} k={k} /><Wheel x={190} y={198} k={k} />
    <circle cx={228} cy={170} r={6} fill={k.gold} />
  </g>
);

/** Three-wheeler: rounded canopy, open side, one front wheel. */
export const AutoRickshaw: PropArt = ({ k }) => (
  <g>
    <Ground w={200} />
    <path d="M52 186 V96 Q52 56 100 52 H170 Q206 54 214 96 L222 168 Q222 186 204 186 Z" fill={k.inkSoft} />
    <path d="M52 182 V98 Q52 62 100 58 H168 Q200 60 208 98 L214 164 Q214 182 198 182 Z" fill={k.gold} />
    <path d="M60 64 Q100 40 170 44 Q200 46 214 70 L210 84 H56 Z" fill={k.ink} />
    <path d="M118 94 H186 Q200 96 202 112 L206 150 H118 Z" fill={k.sky} />
    <rect x={64} y={100} width={44} height={60} rx={8} fill={k.ink} opacity={0.75} />
    <rect x={52} y={158} width={170} height={12} fill={k.green} />
    <Wheel x={84} y={196} r={20} k={k} /><Wheel x={200} y={196} r={20} k={k} />
    <circle cx={216} cy={128} r={6} fill={k.white} />
  </g>
);

export const Car: PropArt = ({ k }) => (
  <g>
    <Ground w={220} />
    <path d="M22 170 Q22 140 48 136 L80 92 Q90 80 108 80 H160 Q178 80 190 94 L216 136 Q238 140 238 166 V184 H22 Z" fill={k.brandD} />
    <path d="M22 164 Q22 134 48 130 L80 88 Q90 76 108 76 H160 Q178 76 190 90 L216 130 Q238 134 238 160 V176 H22 Z" fill={k.brand} />
    <path d="M90 94 Q98 88 110 88 H124 V128 H66 Z" fill={k.sky} />
    <path d="M134 88 H156 Q170 88 178 98 L198 128 H134 Z" fill={k.sky} />
    <rect x={216} y={142} width={20} height={12} rx={6} fill={k.gold} />
    <rect x={22} y={142} width={14} height={12} rx={6} fill={k.red} />
    <Wheel x={70} y={180} r={22} k={k} /><Wheel x={190} y={180} r={22} k={k} />
  </g>
);

export const Boat: PropArt = ({ k }) => (
  <g>
    <path d="M10 214 q 20 -14 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0" stroke={k.blue} strokeWidth={10} fill="none" strokeLinecap="round" />
    <path d="M30 150 H226 L200 200 H58 Z" fill={k.woodD} />
    <path d="M30 144 H226 L204 190 H56 Z" fill={k.wood} />
    <rect x={124} y={34} width={10} height={112} rx={5} fill={k.inkSoft} />
    <path d="M136 40 L210 132 H136 Z" fill={k.paper} />
    <path d="M122 54 L60 132 H122 Z" fill={k.accent} />
    <path d="M134 30 L170 40 L134 50 Z" fill={k.red} />
  </g>
);

export const Plane: PropArt = ({ k }) => (
  <g>
    <Ground w={160} y={230} />
    <g transform="rotate(-12 128 128)">
      <path d="M100 112 L64 40 H88 L150 112 Z" fill={k.brandD} />
      <path d="M100 144 L64 216 H88 L150 144 Z" fill={k.brandD} />
      <path d="M30 128 Q30 104 60 104 H196 Q236 106 236 128 Q236 150 196 152 H60 Q30 152 30 128 Z" fill={k.paper} />
      <path d="M30 128 Q30 140 48 146 H200 Q228 144 234 132 Z" fill={k.grey} />
      <path d="M40 104 L28 66 H48 L72 104 Z" fill={k.brand} />
      {[100, 124, 148, 172].map((x) => <circle key={x} cx={x} cy={122} r={7} fill={k.sky} />)}
      <path d="M206 112 Q222 114 228 124 H206 Z" fill={k.sky} />
    </g>
  </g>
);

export const Truck: PropArt = ({ k }) => (
  <g>
    <Ground w={230} />
    <rect x={14} y={70} width={150} height={112} rx={12} fill={k.brandD} />
    <rect x={14} y={64} width={150} height={110} rx={12} fill={k.brand} />
    <rect x={28} y={84} width={122} height={14} rx={7} fill={k.white} opacity={0.5} />
    <path d="M168 104 H208 Q222 104 228 120 L242 150 V182 H168 Z" fill={k.orange} />
    <path d="M178 114 H204 Q212 114 216 124 L224 142 H178 Z" fill={k.sky} />
    <Wheel x={54} y={190} r={20} k={k} /><Wheel x={120} y={190} r={20} k={k} /><Wheel x={204} y={190} r={20} k={k} />
  </g>
);

export const Bicycle: PropArt = ({ k }) => (
  <g>
    <Ground w={210} />
    <circle cx={64} cy={168} r={46} fill="none" stroke={k.greyD} strokeWidth={12} />
    <circle cx={192} cy={168} r={46} fill="none" stroke={k.greyD} strokeWidth={12} />
    <circle cx={64} cy={168} r={6} fill={k.greyD} /><circle cx={192} cy={168} r={6} fill={k.greyD} />
    <path d="M64 168 L104 104 H176 L192 168 M104 104 L132 168 L176 104 M132 168 H64" stroke={k.red} strokeWidth={10} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    <path d="M96 92 H122" stroke={k.greyD} strokeWidth={10} strokeLinecap="round" />
    <path d="M176 104 L168 76 H190" stroke={k.inkSoft} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={132} cy={168} r={10} fill={k.inkSoft} />
  </g>
);

export const SolarPanel: PropArt = ({ k }) => (
  <g>
    <Ground w={200} />
    <rect x={118} y={150} width={20} height={80} rx={6} fill={k.greyD} />
    <path d="M28 70 H228 L208 170 H48 Z" fill={k.greyD} transform="translate(0 8)" />
    <path d="M28 70 H228 L208 170 H48 Z" fill={k.blueD} />
    {[0, 1, 2].flatMap((r) => [0, 1, 2, 3].map((c) => {
      const y0 = 78 + r * 31, x0 = 40 + c * 45 + r * 4;
      return <path key={`${r}-${c}`} d={`M${x0} ${y0} h40 l-3 26 h-40 z`} fill={k.blue} />;
    }))}
    <path d="M62 86 L52 132" stroke="#BFE3FF" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
  </g>
);
