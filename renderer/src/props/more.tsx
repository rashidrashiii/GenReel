// Tier 2, batch D: jewellery, security, people, offers, money.
import { Ground, type PropArt } from "./kit";

export const GoldRing: PropArt = ({ k }) => (
  <g>
    <Ground w={150} />
    <ellipse cx={128} cy={160} rx={80} ry={62} fill="none" stroke={k.goldD} strokeWidth={26} />
    <ellipse cx={128} cy={152} rx={80} ry={62} fill="none" stroke={k.gold} strokeWidth={22} />
    <path d="M100 62 L128 34 L156 62 L128 98 Z" fill={k.sky} />
    <path d="M100 62 H156 L128 98 Z" fill="#BFE3FF" />
    <path d="M116 46 L128 34 L140 46" stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);

export const Necklace: PropArt = ({ k }) => (
  <g>
    <Ground w={150} />
    <path d="M40 40 Q48 170 128 186 Q208 170 216 40" stroke={k.gold} strokeWidth={10} fill="none" strokeLinecap="round" />
    {Array.from({ length: 11 }, (_, i) => {
      const t = i / 10, x = 40 + 176 * t, y = 40 + 146 * Math.sin(Math.PI * t) * 1.0;
      return <circle key={i} cx={x} cy={Math.min(y, 186)} r={9} fill={k.goldD} />;
    })}
    <path d="M128 176 L150 204 L128 236 L106 204 Z" fill={k.red} />
    <circle cx={128} cy={204} r={8} fill="#FFD7DA" />
  </g>
);

export const Key: PropArt = ({ k }) => (
  <g>
    <Ground w={170} />
    <g transform="rotate(-30 128 128)">
      <circle cx={78} cy={128} r={46} fill={k.goldD} />
      <circle cx={78} cy={122} r={46} fill={k.gold} />
      <circle cx={78} cy={122} r={18} fill={k.paper} />
      <rect x={118} y={112} width={110} height={22} rx={8} fill={k.gold} />
      <rect x={186} y={132} width={16} height={26} rx={4} fill={k.gold} />
      <rect x={210} y={132} width={16} height={18} rx={4} fill={k.gold} />
    </g>
  </g>
);

export const Lock: PropArt = ({ k }) => (
  <g>
    <Ground w={160} />
    <path d="M78 116 V82 Q78 34 128 34 Q178 34 178 82 V116" stroke={k.greyD} strokeWidth={22} fill="none" />
    <rect x={52} y={110} width={152} height={120} rx={20} fill={k.goldD} />
    <rect x={52} y={104} width={152} height={118} rx={20} fill={k.gold} />
    <circle cx={128} cy={152} r={16} fill={k.ink} />
    <rect x={121} y={156} width={14} height={34} rx={7} fill={k.ink} />
  </g>
);

const shield = "M128 22 L212 52 V120 Q212 192 128 232 Q44 192 44 120 V52 Z";
export const Shield: PropArt = ({ k }) => (
  <g>
    <path d={shield} fill={k.brandD} transform="translate(0 8)" />
    <path d={shield} fill={k.brand} />
    <path d="M128 40 L194 64 V120 Q194 176 128 210 Z" fill={k.brandD} opacity={0.35} />
    <path d="M90 124 L118 152 L170 98" stroke={k.white} strokeWidth={20} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

const Figure = ({ x, s, shirt, k }: { x: number; s: number; shirt: string; k: { skin: string; hair: string } & Record<string, string> }) => (
  <g transform={`translate(${x} 0) scale(${s}) translate(${-x} 0)`}>
    <path d={`M${x - 46} 236 V190 Q${x - 46} 150 ${x} 148 Q${x + 46} 150 ${x + 46} 190 V236 Z`} fill={shirt} />
    <circle cx={x} cy={110} r={36} fill={k.skin} />
    <path d={`M${x - 36} 108 Q${x - 38} 70 ${x} 70 Q${x + 38} 70 ${x + 36} 108 Q${x + 22} 90 ${x} 92 Q${x - 22} 90 ${x - 36} 108 Z`} fill={k.hair} />
  </g>
);

export const PeopleGroup: PropArt = ({ k }) => {
  const kk = { ...k, hair: "#2A1C14" };
  return (
    <g>
      <Ground w={210} />
      <g transform="translate(0 -14)"><Figure x={64} s={0.85} shirt={k.accent} k={kk} /><Figure x={192} s={0.85} shirt={k.orange} k={kk} /></g>
      <Figure x={128} s={1} shirt={k.brand} k={kk} />
    </g>
  );
};

export const Person: PropArt = ({ k }) => (
  <g>
    <Ground w={150} />
    <circle cx={128} cy={128} r={100} fill={k.light} />
    <Figure x={128} s={1.05} shirt={k.brand} k={{ ...k, hair: "#2A1C14" }} />
  </g>
);

const burst = (n: number, R: number, r: number) => Array.from({ length: n * 2 }, (_, i) => {
  const a = (Math.PI / n) * i - Math.PI / 2, rad = i % 2 ? r : R;
  return `${i ? "L" : "M"}${(128 + Math.cos(a) * rad).toFixed(1)} ${(128 + Math.sin(a) * rad).toFixed(1)}`;
}).join(" ") + " Z";

/** A round badge with a % sign drawn as shapes. */
export const PercentBadge: PropArt = ({ k }) => (
  <g>
    <Ground w={170} />
    <circle cx={128} cy={136} r={100} fill={k.redD} />
    <circle cx={128} cy={128} r={100} fill={k.red} />
    <circle cx={128} cy={128} r={78} fill="none" stroke="#FFD7DA" strokeWidth={6} strokeDasharray="10 10" />
    <circle cx={96} cy={96} r={20} fill="none" stroke={k.white} strokeWidth={14} />
    <circle cx={160} cy={160} r={20} fill="none" stroke={k.white} strokeWidth={14} />
    <path d="M170 82 L86 174" stroke={k.white} strokeWidth={16} strokeLinecap="round" />
  </g>
);

/** Starburst "sale" sticker (no text: a burst with a bold ribbon). */
export const SaleBurst: PropArt = ({ k }) => (
  <g>
    <path d={burst(14, 118, 94)} fill={k.goldD} transform="translate(0 8)" />
    <path d={burst(14, 118, 94)} fill={k.gold} />
    <path d={burst(14, 84, 70)} fill="#FFE38A" />
    <rect x={36} y={106} width={184} height={44} rx={10} fill={k.red} transform="rotate(-10 128 128)" />
    <rect x={60} y={120} width={136} height={14} rx={7} fill={k.white} transform="rotate(-10 128 128)" />
  </g>
);

const slice = (a0: number, a1: number, r = 96) => {
  const p = (a: number) => `${(128 + Math.cos(a) * r).toFixed(1)} ${(128 + Math.sin(a) * r).toFixed(1)}`;
  return `M128 128 L${p(a0)} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)} Z`;
};
export const PieChart: PropArt = ({ k }) => (
  <g>
    <Ground w={180} />
    <circle cx={128} cy={136} r={96} fill={k.greyD} />
    <path d={slice(-Math.PI / 2, Math.PI * 0.55)} fill={k.brand} />
    <path d={slice(Math.PI * 0.55, Math.PI * 1.15)} fill={k.accent} />
    <path d={slice(Math.PI * 1.15, Math.PI * 1.5)} fill={k.orange} />
    <circle cx={128} cy={128} r={36} fill={k.white} />
  </g>
);

export const Wallet: PropArt = ({ k }) => (
  <g>
    <Ground w={200} />
    <rect x={56} y={52} width={130} height={70} rx={8} fill={k.green} transform="rotate(-8 120 86)" />
    <rect x={30} y={84} width={196} height={140} rx={20} fill={k.woodD} />
    <rect x={30} y={78} width={196} height={136} rx={20} fill={k.wood} />
    <path d="M150 116 H226 V176 H150 Q130 176 130 146 Q130 116 150 116 Z" fill={k.woodD} />
    <circle cx={156} cy={146} r={10} fill={k.gold} />
  </g>
);

export const CreditCard: PropArt = ({ k }) => (
  <g>
    <Ground w={210} />
    <g transform="rotate(-8 128 128)">
      <rect x={24} y={62} width={208} height={136} rx={18} fill={k.brandD} transform="translate(0 8)" />
      <rect x={24} y={62} width={208} height={136} rx={18} fill={k.brand} />
      <rect x={24} y={86} width={208} height={26} fill={k.ink} />
      <rect x={44} y={128} width={40} height={30} rx={6} fill={k.gold} />
      <rect x={44} y={170} width={110} height={10} rx={5} fill={k.white} opacity={0.8} />
      <circle cx={186} cy={160} r={16} fill={k.red} opacity={0.9} />
      <circle cx={206} cy={160} r={16} fill={k.gold} opacity={0.9} />
    </g>
  </g>
);

/** Two folded sarees with gold kasavu borders; the front one shows its draped end (pallu). */
export const Saree: PropArt = ({ k }) => {
  const cream = "#F7F0DC", creamD = "#E3D6B5";
  const Fold = ({ y, body, bodyD }: { y: number; body: string; bodyD: string }) => (
    <g>
      <rect x={36} y={y + 8} width={184} height={70} rx={12} fill={bodyD} />
      <rect x={36} y={y} width={184} height={70} rx={12} fill={body} />
      <rect x={36} y={y + 8} width={184} height={12} fill={k.gold} />
      <rect x={36} y={y + 50} width={184} height={12} fill={k.gold} />
      {[60, 92, 124, 156, 188].map((x) => <circle key={x} cx={x} cy={y + 35} r={5} fill={k.goldD} opacity={0.8} />)}
    </g>
  );
  return (
    <g>
      <Ground w={210} />
      <Fold y={62} body={k.brand} bodyD={k.brandD} />
      <Fold y={142} body={cream} bodyD={creamD} />
      {/* pallu draped over the front fold */}
      <path d="M150 136 L214 136 Q226 180 206 228 L176 228 Q190 184 150 136 Z" fill={cream} />
      <path d="M150 136 L214 136 Q226 180 206 228 L196 228 Q212 184 168 140 Z" fill={k.gold} opacity={0.9} />
    </g>
  );
};

export const Shirt: PropArt = ({ k }) => (
  <g>
    <Ground w={190} />
    <path d="M88 40 L48 60 L18 112 L58 132 L72 112 V224 H184 V112 L198 132 L238 112 L208 60 L168 40 Q128 70 88 40 Z" fill={k.brandD} transform="translate(0 6)" />
    <path d="M88 40 L48 60 L18 112 L58 132 L72 112 V224 H184 V112 L198 132 L238 112 L208 60 L168 40 Q128 70 88 40 Z" fill={k.brand} />
    <path d="M88 40 Q128 70 168 40 L156 36 Q128 56 100 36 Z" fill={k.light} />
    <path d="M128 66 V224" stroke={k.brandD} strokeWidth={4} />
    {[96, 136, 176].map((y) => <circle key={y} cx={128} cy={y} r={5} fill={k.light} />)}
  </g>
);
