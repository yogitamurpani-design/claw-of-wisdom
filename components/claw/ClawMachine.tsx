"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/8bit/badge";
import { Button } from "@/components/ui/8bit/button";
import { Kbd } from "@/components/ui/8bit/kbd";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/8bit/toggle-group";
import { CreditsInfo } from "@/components/claw/CreditsInfo";
import { Inventory } from "@/components/claw/Inventory";
import { PrizeCard, type Prize } from "@/components/claw/PrizeCard";
import { GIFTS, PixelClaw, PixelCoin, PixelGift, type Gift } from "@/components/claw/sprites";
import { setMuted, sfx, startHum, stopHum } from "@/lib/sfx";
import { CATEGORIES, randomQuote, type Category } from "@/lib/quotes";
import { cn } from "@/lib/utils";

/* ── geometry (px inside the glass window) ── */
const WINDOW_H = 340;
const CAP = 48; // gift sprite: 12px × 4
const RAIL_TOP = 12;
const REST_CABLE = 16;
const HOME_X = 60; // % across the window
const CHUTE_X = 12;
const MIN_X = 30;
const MAX_X = 88;
const STEP = 6;
const ROW_BOTTOM = [8, 40];
const giftTop = (row: number) => WINDOW_H - ROW_BOTTOM[row] - CAP;
const cableFor = (row: number) => giftTop(row) - 32;
const FLOOR_CABLE = cableFor(0);

/* ── timing (ms) ── */
const T = { drop: 900, grab: 350, lift: 900, carry: 900, release: 650, back: 700 };
const SLIP_CHANCE = 1 / 6;
const START_CREDITS = 0; // players must insert a coin before the first game
const MAX_CREDITS = 9;

type GiftItem = { id: number; x: number; row: number; gift: Gift };
type Phase = "idle" | "dropping" | "grabbing" | "lifting" | "carrying" | "releasing" | "returning";
type Pick = Category | "any";

const SLOTS: { x: number; row: number }[] = [
  { x: 34, row: 0 }, { x: 46, row: 0 }, { x: 58, row: 0 }, { x: 70, row: 0 }, { x: 82, row: 0 },
  { x: 40, row: 1 }, { x: 52, row: 1 }, { x: 64, row: 1 }, { x: 76, row: 1 },
];

const initialGifts = (): GiftItem[] =>
  SLOTS.map((s, i) => ({ ...s, id: i, gift: GIFTS[i % GIFTS.length] }));

const PICKS: { id: Pick; label: string }[] = [
  { id: "any", label: "Surprise" },
  ...CATEGORIES.map(({ id, label }) => ({ id, label })),
];

export function VibeIcon({ type }: { type: Pick }) {
  const common = {
    viewBox: "0 0 16 16",
    width: 18,
    height: 18,
    "aria-hidden": true,
    shapeRendering: "crispEdges" as const,
  };

  if (type === "motivation") {
    return (
      <svg {...common}>
        <path d="M9 1h5l-4 5h4L6 15l2-7H4l5-7Z" fill="#ffd84d" stroke="#3d3a4b" strokeWidth="1" />
      </svg>
    );
  }

  if (type === "life") {
    return (
      <svg {...common}>
        <path d="M3 3h3v2h1V3h2v2h1V3h3v2h1v4h-2v2h-2v2H6v-2H4v-2H2V5h1V3Z" fill="#ff8fab" stroke="#3d3a4b" strokeWidth="1" />
      </svg>
    );
  }

  if (type === "funny") {
    return (
      <svg {...common}>
        <rect x="2" y="2" width="12" height="12" fill="#ffd84d" stroke="#3d3a4b" strokeWidth="1.5" />
        <rect x="5" y="6" width="2" height="2" fill="#3d3a4b" />
        <rect x="9" y="6" width="2" height="2" fill="#3d3a4b" />
        <rect x="5" y="10" width="6" height="2" fill="#fff8c9" stroke="#3d3a4b" strokeWidth="1" />
        <rect x="7" y="11" width="2" height="1" fill="#ff8fab" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M8 1h2v4h4v2h-4v4H8V7H4V5h4V1Z" fill="#fff8c9" stroke="#3d3a4b" strokeWidth="1" />
      <rect x="12" y="10" width="2" height="2" fill="#ffd84d" stroke="#3d3a4b" />
      <rect x="3" y="10" width="2" height="2" fill="#ffd84d" stroke="#3d3a4b" />
    </svg>
  );
}

export function ClawMachine() {
  const [pick, setPick] = useState<Pick>("any");
  const [gifts, setGifts] = useState<GiftItem[]>(initialGifts);
  const [phase, setPhase] = useState<Phase>("idle");
  const [clawX, setClawX] = useState(HOME_X);
  const [cable, setCable] = useState(REST_CABLE);
  const [closed, setClosed] = useState(false);
  const [held, setHeld] = useState<Gift | null>(null);
  const [falling, setFalling] = useState<Gift | null>(null);
  const [prize, setPrize] = useState<Prize | null>(null);
  const [inventory, setInventory] = useState<Prize[]>([]);
  const [message, setMessage] = useState("INSERT COIN TO START!");
  const [credits, setCredits] = useState(START_CREDITS);
  const [coinKey, setCoinKey] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [sound, setSound] = useState(true);

  const timers = useRef<number[]>([]);
  const alive = useRef(true);
  const speed = useRef(1);
  const nextId = useRef(SLOTS.length);
  const lastQuote = useRef<string | undefined>(undefined);
  const dropBtn = useRef<HTMLButtonElement>(null);
  const prizeRef = useRef<HTMLDivElement>(null);

  // restore the sound preference
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("claw-sfx");
    } catch {}
    if (saved === "off") {
      setMuted(true);
      setSound(false); // eslint-disable-line react-hooks/set-state-in-effect
    }
    return () => stopHum();
  }, []);

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setMuted(!next);
    if (next) sfx.click();
    try {
      localStorage.setItem("claw-sfx", next ? "on" : "off");
    } catch {}
  };

  useEffect(() => {
    alive.current = true;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => (speed.current = mq.matches ? 0.05 : 1);
    sync();
    mq.addEventListener("change", sync);
    const list = timers.current;
    return () => {
      alive.current = false;
      mq.removeEventListener("change", sync);
      list.forEach(clearTimeout);
    };
  }, []);

  const wait = (ms: number) =>
    new Promise<boolean>((resolve) => {
      timers.current.push(window.setTimeout(() => resolve(alive.current), ms * speed.current));
    });

  /** wait out one claw movement with the soft hum playing */
  const moving = async (ms: number, rising: boolean) => {
    startHum(rising);
    const ok = await wait(ms);
    stopHum();
    return ok;
  };

  const busy = phase !== "idle";
  const locked = credits <= 0 && !busy;

  const needCoin = useCallback(() => {
    sfx.denied();
    setMessage("INSERT COIN TO PLAY!");
    setShakeKey((k) => k + 1);
  }, []);

  const move = useCallback(
    (dir: -1 | 1) => {
      if (busy) return;
      if (credits <= 0) return needCoin();
      sfx.move();
      setClawX((x) => Math.min(MAX_X, Math.max(MIN_X, x + dir * STEP)));
    },
    [busy, credits, needCoin],
  );

  const insertCoin = () => {
    if (credits >= MAX_CREDITS) {
      sfx.denied();
      setMessage("CREDIT LIMIT REACHED. GO PLAY!");
      return;
    }
    sfx.coin();
    setCredits((c) => Math.min(MAX_CREDITS, c + 3));
    setCoinKey((k) => k + 1);
    if (!busy) setMessage("CLINK! +3 CREDITS. MOVE THE CLAW AND DROP!");
  };

  const play = useCallback(async () => {
    if (busy) return;
    if (credits <= 0) return needCoin();
    setCredits((c) => c - 1);

    // gift under the claw: the top row sits on top, so prefer it
    const target = gifts
      .filter((g) => Math.abs(g.x - clawX) <= 6)
      .sort((a, b) => b.row - a.row || Math.abs(a.x - clawX) - Math.abs(b.x - clawX))[0];

    setMessage("HERE WE GO...");
    setPhase("dropping");
    setClosed(false);
    setCable(target ? cableFor(target.row) : FLOOR_CABLE);
    if (!(await moving(T.drop, false))) return;

    setPhase("grabbing");
    setClosed(true);
    sfx.grab();
    if (!(await wait(T.grab))) return;

    if (!target) {
      setPhase("lifting");
      setCable(REST_CABLE);
      if (!(await moving(T.lift, true))) return;
      setClosed(false);
      sfx.miss();
      setMessage("MISS! LINE THE CLAW UP OVER A GIFT.");
      setPhase("idle");
      return;
    }

    setHeld(target.gift);
    setGifts((gs) => gs.filter((g) => g.id !== target.id));
    setPhase("lifting");
    setCable(REST_CABLE);

    if (inventory.length > 0 && Math.random() < SLIP_CHANCE) {
      startHum(true);
      const okSlip = await wait(T.lift * 0.4);
      stopHum();
      if (!okSlip) return;
      setHeld(null);
      setClosed(false);
      setGifts((gs) => [...gs, target]);
      sfx.miss();
      setMessage("OOPS, IT SLIPPED! TRY AGAIN.");
      if (!(await wait(T.lift * 0.6))) return;
      setPhase("idle");
      return;
    }
    if (!(await moving(T.lift, true))) return;

    setPhase("carrying");
    setClawX(CHUTE_X);
    if (!(await moving(T.carry, true))) return;

    setPhase("releasing");
    setClosed(false);
    setHeld(null);
    setFalling(target.gift);
    sfx.release();
    if (!(await wait(T.release))) return;

    const q = randomQuote(pick, lastQuote.current);
    lastQuote.current = q.text;
    const won: Prize = { id: Date.now(), ...q, gift: target.gift };
    setFalling(null);
    setPrize(won);
    setInventory((inv) => [won, ...inv]);
    sfx.win();
    setMessage("YOU WON A QUOTE!");
    setGifts((gs) => [
      ...gs,
      { ...target, id: nextId.current++, gift: GIFTS[Math.floor(Math.random() * GIFTS.length)] },
    ]);
    const box = prizeRef.current?.getBoundingClientRect();
    if (box && (box.top < 0 || box.top > window.innerHeight - 160)) {
      prizeRef.current?.scrollIntoView({ behavior: speed.current < 1 ? "auto" : "smooth", block: "center" });
    }

    setPhase("returning");
    setClawX(HOME_X);
    if (!(await moving(T.back, false))) return;
    setPhase("idle");
  }, [busy, gifts, clawX, credits, inventory.length, pick, needCoin]); // eslint-disable-line react-hooks/exhaustive-deps

  /* keyboard: ← → move, space drops, C inserts a coin (unless a control has focus) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, button, [role=radio], [role=dialog]")) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
      else if (e.key === " ") { e.preventDefault(); play(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, play]);

  const moveMs = phase === "carrying" ? T.carry : T.back;

  return (
    <div className="mx-auto flex w-full max-w-[460px] flex-col items-stretch gap-12">
      {/* ── machine ── */}
      <section aria-label="Claw machine" className="flex w-full flex-col gap-6">
        {/* HUD */}
        <div className="pixel-box-lift relative bg-card p-4">
          <div className="retro flex items-center justify-between gap-3 text-[10px]">
            <span className="flex items-center gap-2">
              <PixelCoin scale={2} />
              CREDITS <span className="text-bubblegum">{String(credits).padStart(2, "0")}</span>
            </span>
            <div className="absolute -top-3 left-3">
              <CreditsInfo />
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={toggleSound}
                aria-pressed={sound}
                aria-label={sound ? "Mute sound effects" : "Turn on sound effects"}
                className="bg-card px-2 text-[8px]"
              >
                {sound ? "Sound ON" : "Sound OFF"}
              </Button>
              <Inventory items={inventory} />
            </div>
          </div>
        </div>

        {/* category */}
        <div className="flex flex-col gap-3">
          <span className="retro text-[9px] text-muted-foreground">1. PICK A VIBE</span>
          <ToggleGroup
            type="single"
            value={pick}
            onValueChange={(v) => v && setPick(v as Pick)}
            aria-label="Quote type"
            className="flex flex-wrap justify-start gap-3"
          >
            {PICKS.map((p) => (
              <ToggleGroupItem
                key={p.id}
                value={p.id}
                variant="outline"
                className="bg-card px-3 text-[9px] data-[state=on]:bg-butter"
              >
                <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center">
                  <VibeIcon type={p.id} />
                </span>
                {p.label.toUpperCase()}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* cabinet */}
        <div className="pixel-box-lift bg-blush p-4">
          {/* marquee */}
          <div className="pixel-box mb-5 flex items-center justify-between gap-2 bg-ink px-3 py-3">
            <span className="flex gap-1.5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span key={i} className="bulb size-2 bg-butter" style={{ animationDelay: `-${i * 270}ms` }} />
              ))}
            </span>
            <p className="retro text-center text-[10px] leading-relaxed text-butter sm:text-xs">
              CLAW <span className="text-blush">OF</span> WISDOM
            </p>
            <span className="flex gap-1.5" aria-hidden="true">
              {[3, 4, 5].map((i) => (
                <span key={i} className="bulb size-2 bg-butter" style={{ animationDelay: `-${i * 270}ms` }} />
              ))}
            </span>
          </div>

          {/* glass window */}
          <div className="pixel-box glass-pixels scanlines relative overflow-hidden" style={{ height: WINDOW_H }}>
            {/* rail */}
            <div
              className="absolute inset-x-2 h-2 bg-ink"
              style={{ top: RAIL_TOP - 8 }}
              aria-hidden="true"
            />

            {/* chute */}
            <div
              className="absolute bottom-0 flex h-28 w-20 -translate-x-1/2 flex-col items-center justify-end gap-1 border-x-4 border-t-4 border-ink bg-butter/70 pb-2"
              style={{ left: `${CHUTE_X}%` }}
              aria-hidden="true"
            >
              <span className="retro text-[7px]">PRIZE</span>
              <span className="retro anim-blink text-[8px]">▼</span>
            </div>

            {/* gifts in the pit */}
            {gifts.map((c) => (
              <div
                key={c.id}
                className="absolute -translate-x-1/2"
                style={{ left: `${c.x}%`, bottom: ROW_BOTTOM[c.row], zIndex: c.row + 1 }}
              >
                <PixelGift gift={c.gift} />
              </div>
            ))}

            {/* falling prize */}
            {falling && (
              <div
                className="falling absolute"
                style={{ left: `${CHUTE_X}%`, top: RAIL_TOP + REST_CABLE + 20, zIndex: 5 }}
              >
                <PixelGift gift={falling} />
              </div>
            )}

            {/* claw */}
            <div
              data-motion
              className="absolute z-10 flex -translate-x-1/2 flex-col items-center"
              style={{ left: `${clawX}%`, top: RAIL_TOP, transition: `left ${moveMs}ms steps(12)` }}
            >
              <div
                data-motion
                className="w-1 bg-ink"
                style={{
                  height: cable,
                  transition: `height ${phase === "dropping" ? T.drop : T.lift}ms steps(16)`,
                }}
              />
              <div className="relative">
                {held && (
                  <div className="absolute top-5 left-2">
                    <PixelGift gift={held} />
                  </div>
                )}
                <div className="relative">
                  <PixelClaw closed={closed} />
                </div>
              </div>
            </div>
          </div>

          {/* control deck */}
          <div className="pixel-box mt-6 flex flex-wrap items-center justify-between gap-4 bg-card p-4">
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => move(-1)}
                disabled={busy || clawX <= MIN_X}
                aria-label="Move claw left"
                className="bg-sky px-3 text-xs"
              >
                ◀
              </Button>
              <Button
                variant="outline"
                onClick={() => move(1)}
                disabled={busy || clawX >= MAX_X}
                aria-label="Move claw right"
                className="bg-sky px-3 text-xs"
              >
                ▶
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div key={`shake-${shakeKey}`} className={cn("relative", shakeKey > 0 && "anim-shake")}>
                {coinKey > 0 && (
                  <span key={coinKey} className="coin-drop pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2">
                    <PixelCoin scale={3} />
                  </span>
                )}
                <Button
                  variant="outline"
                  onClick={insertCoin}
                  className={cn("bg-butter text-[8px] leading-tight", credits === 0 && "anim-blink")}
                >
                  INSERT
                  <br />
                  COIN
                </Button>
              </div>
              <Button
                ref={dropBtn}
                onClick={play}
                disabled={busy}
                className={cn("bg-bubblegum py-5 pr-6 pl-[26px] text-sm text-ink hover:bg-bubblegum/85", locked && "opacity-50")}
              >
                DROP!
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p role="status" aria-live="polite" className="retro text-center text-[9px] leading-relaxed">
            {message}
          </p>
          <p className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <Kbd>←</Kbd>
            <Kbd>→</Kbd> move
            <Kbd>SPACE</Kbd> drop
          </p>
        </div>
      </section>

      {/* ── prize ── */}
      <section ref={prizeRef} aria-label="Your quote" className="flex w-full flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="retro text-xs">2. YOUR PRIZE</h2>
          <Badge className="bg-butter text-[8px]">WON: {inventory.length}</Badge>
        </div>
        <PrizeCard prize={prize} />
      </section>
    </div>
  );
}
