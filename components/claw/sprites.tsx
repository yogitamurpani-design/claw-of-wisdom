/**
 * Tiny pixel-art sprites drawn from string grids.
 * Each character is one "pixel"; "." is transparent.
 */

const INK = "#3d3a4b";
const METAL = "#a89fd0";
const METAL_LIGHT = "#d9d3f5";

type SpriteProps = {
  rows: string[];
  palette: Record<string, string>;
  scale?: number;
  className?: string;
  title?: string;
};

function Sprite({ rows, palette, scale = 4, className, title }: SpriteProps) {
  const w = rows[0].length;
  const h = rows.length;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w * scale}
      height={h * scale}
      className={`sprite ${className ?? ""}`}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
    >
      {rows.flatMap((row, y) => {
        // merge horizontal runs of the same colour into one rect
        const out: React.ReactNode[] = [];
        let x = 0;
        while (x < w) {
          const c = row[x];
          let end = x + 1;
          while (end < w && row[end] === c) end++;
          if (c !== "." && palette[c]) {
            out.push(<rect key={`${x}-${y}`} x={x} y={y} width={end - x} height={1} fill={palette[c]} />);
          }
          x = end;
        }
        return out;
      })}
    </svg>
  );
}

/** A pastel box with a ribbon colour that contrasts with it. */
export type Gift = { box: string; ribbon: string };

export const GIFTS: Gift[] = [
  { box: "#ffc8dd", ribbon: "#ffffff" },
  { box: "#a2d2ff", ribbon: "#ff8fab" },
  { box: "#fdf3a7", ribbon: "#a2d2ff" },
  { box: "#bde0c6", ribbon: "#ff8fab" },
  { box: "#d6c8f0", ribbon: "#fdf3a7" },
  { box: "#ffd3b4", ribbon: "#bde0c6" },
];

// 12 × 12: bow, lid, then the box body with a vertical ribbon
const GIFT = [
  "..ooo..ooo..",
  ".o222oo222o.",
  "..oo2222oo..",
  "oooooooooooo",
  "o1w11221111o",
  "oooooooooooo",
  ".o1112211so.",
  ".o1112211so.",
  ".o2222222so.",
  ".o1112211so.",
  ".o1112211so.",
  ".oooooooooo.",
];

export function PixelGift({ gift, scale = 4, className }: { gift: Gift; scale?: number; className?: string }) {
  return (
    <Sprite
      rows={GIFT}
      palette={{
        o: INK,
        "1": gift.box,
        "2": gift.ribbon,
        w: "#ffffff",
        s: `color-mix(in srgb, ${gift.box} 78%, ${INK})`,
      }}
      scale={scale}
      className={className}
    />
  );
}

const CLAW_HEAD = [
  ".....oooooo.....",
  ".....o2ww2o.....",
  ".....o2222o.....",
  "oooooooooooooooo",
  "o2www222222222go",
  "o22222222222222o",
  "oogoooooooooogoo",
];

const CLAW_OPEN = [
  ...CLAW_HEAD,
  "o2o..........o2o",
  "o2o..........o2o",
  "o2o..........o2o",
  "o2o..........o2o",
  "o22o........o22o",
  ".oo..........oo.",
];

const CLAW_CLOSED = [
  ...CLAW_HEAD,
  ".o2o........o2o.",
  "..o2o......o2o..",
  "..o2o......o2o..",
  "..o2o......o2o..",
  "..o22o....o22o..",
  "...ooo....ooo...",
];

export const CLAW_PX = { width: 16, height: 13 };

export function PixelClaw({ closed, scale = 4 }: { closed: boolean; scale?: number }) {
  return (
    <Sprite
      rows={closed ? CLAW_CLOSED : CLAW_OPEN}
      palette={{ o: INK, "2": METAL, w: METAL_LIGHT, g: "#ff8fab" }}
      scale={scale}
    />
  );
}

const COIN = [
  "..oooo..",
  ".oyyyyo.",
  "oyywyyyo",
  "oywyyoyo",
  "oyyyyoyo",
  "oyyyoyyo",
  ".oyyyyo.",
  "..oooo..",
];

export function PixelCoin({ scale = 3, className }: { scale?: number; className?: string }) {
  return <Sprite rows={COIN} palette={{ o: INK, y: "#ffd84d", w: "#fff8c9" }} scale={scale} className={className} />;
}

const STAR = [
  "...o...",
  "...o...",
  "..oyo..",
  "ooyyyoo",
  "..oyo..",
  "...o...",
  "...o...",
];

export function PixelStar({ scale = 3, className }: { scale?: number; className?: string }) {
  return <Sprite rows={STAR} palette={{ o: INK, y: "#fdf3a7" }} scale={scale} className={className} />;
}

const SPARKLE = [
  "...o...",
  "..oyo..",
  "..oyo..",
  "ooyyyoo",
  "..oyo..",
  "..oyo..",
  "...o...",
];

export function PixelSparkle({ scale = 3, className }: { scale?: number; className?: string }) {
  return <Sprite rows={SPARKLE} palette={{ o: INK, y: "#fff8c9" }} scale={scale} className={className} />;
}

const LIGHTNING = [
  "....oo",
  "...oyo",
  "..oyo.",
  ".oyyo.",
  "..yo..",
  "..yo..",
  ".yo...",
  "o.....",
];

export function PixelRocket({ scale = 3, className }: { scale?: number; className?: string }) {
  return <Sprite rows={LIGHTNING} palette={{ o: INK, y: "#ffd84d" }} scale={scale} className={className} />;
}

const HEART = [
  ".oo.oo.",
  "oyyyyyo",
  "oyyyyyo",
  ".oyyyyo",
  "..oyyo.",
  "...yo..",
  "....o..",
];

export function PixelSprout({ scale = 3, className }: { scale?: number; className?: string }) {
  return <Sprite rows={HEART} palette={{ o: INK, y: "#ff8fab" }} scale={scale} className={className} />;
}

const FUNNY_FACE = [
  ".ooooooo.",
  "oyyyyyoyo",
  "oyoyoyoyo",
  "oyyyyyoyo",
  "oyoooooyo",
  "oyowwwoyo",
  "oyowwwoyo",
  ".oyyyyyo.",
];

export function PixelFunnyFace({ scale = 3, className }: { scale?: number; className?: string }) {
  return <Sprite rows={FUNNY_FACE} palette={{ o: INK, y: "#ffd84d", w: "#ff8fab" }} scale={scale} className={className} />;
}

export function VibeIcon({ type }: { type: "any" | "motivation" | "life" | "funny" }) {
  const common = {
    viewBox: "0 0 16 16",
    width: 18,
    height: 18,
    "aria-hidden": true,
    shapeRendering: "crispEdges" as const,
  };

  if (type === "motivation") {
    return <svg {...common}><path d="M9 1h5l-4 5h4L6 15l2-7H4l5-7Z" fill="#ffd84d" stroke="#3d3a4b" strokeWidth="1" /></svg>;
  }
  if (type === "life") {
    return <svg {...common}><path d="M3 3h3v2h1V3h2v2h1V3h3v2h1v4h-2v2h-2v2H6v-2H4v-2H2V5h1V3Z" fill="#ff8fab" stroke="#3d3a4b" strokeWidth="1" /></svg>;
  }
  if (type === "funny") {
    return <svg {...common}><rect x="2" y="2" width="12" height="12" fill="#ffd84d" stroke="#3d3a4b" strokeWidth="1.5" /><rect x="5" y="6" width="2" height="2" fill="#3d3a4b" /><rect x="9" y="6" width="2" height="2" fill="#3d3a4b" /><rect x="5" y="10" width="6" height="2" fill="#fff8c9" stroke="#3d3a4b" strokeWidth="1" /><rect x="7" y="11" width="2" height="1" fill="#ff8fab" /></svg>;
  }
  return <svg {...common}><path d="M8 1h2v4h4v2h-4v4H8V7H4V5h4V1Z" fill="#fff8c9" stroke="#3d3a4b" strokeWidth="1" /><rect x="12" y="10" width="2" height="2" fill="#ffd84d" stroke="#3d3a4b" /><rect x="3" y="10" width="2" height="2" fill="#ffd84d" stroke="#3d3a4b" /></svg>;
}
