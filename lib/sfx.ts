/**
 * Tiny chiptune sound effects made with the Web Audio API. No audio files.
 * The AudioContext is created lazily on the first sound, which always
 * follows a click or key press, so browsers allow it to play.
 */

let ctx: AudioContext | null = null;
let muted = false;

export const setMuted = (m: boolean) => {
  muted = m;
  if (m) stopHum();
};

function audio() {
  if (muted || typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

type ToneOpts = {
  freq: number;
  to?: number; // slide to this frequency
  dur: number; // seconds
  at?: number; // delay in seconds
  type?: OscillatorType;
  vol?: number;
};

function tone({ freq, to, dur, at = 0, type = "square", vol = 0.08 }: ToneOpts) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + at;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise(dur: number, at = 0, vol = 0.12) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + at;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = a.createBufferSource();
  const gain = a.createGain();
  src.buffer = buf;
  gain.gain.value = vol;
  src.connect(gain).connect(a.destination);
  src.start(t);
}

/* ── soft movement hum ──────────────────────────────────────────
 * A very quiet, airy hum for when the claw moves: a low sine plus a
 * whisper of softened noise, both heavily low-passed and faded in and
 * out slowly so there are no clicks, buzz or rattle.
 */
type Hum = { osc: OscillatorNode; air: AudioBufferSourceNode; out: GainNode };
let hum: Hum | null = null;
let airBuffer: AudioBuffer | null = null;

function getAirBuffer(a: AudioContext) {
  if (airBuffer) return airBuffer;
  // 2s of smoothed ("brown") noise: soft and breathy rather than hissy
  const len = a.sampleRate * 2;
  airBuffer = a.createBuffer(1, len, a.sampleRate);
  const d = airBuffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    d[i] = last * 3.5;
  }
  return airBuffer;
}

function startHumNodes(a: AudioContext, pitch: number, vol: number, fadeIn: number): Hum {
  const t = a.currentTime;
  const out = a.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.linearRampToValueAtTime(vol, t + fadeIn);
  const lp = a.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 420;
  lp.Q.value = 0.3;
  lp.connect(out).connect(a.destination);

  const osc = a.createOscillator();
  osc.type = "sine";
  osc.frequency.value = pitch;
  const oscGain = a.createGain();
  oscGain.gain.value = 0.6;
  osc.connect(oscGain).connect(lp);
  osc.start(t);

  const air = a.createBufferSource();
  air.buffer = getAirBuffer(a);
  air.loop = true;
  const airGain = a.createGain();
  airGain.gain.value = 0.5;
  air.connect(airGain).connect(lp);
  air.start(t);

  return { osc, air, out };
}

function fadeHum(a: AudioContext, h: Hum, fadeOut: number) {
  const t = a.currentTime;
  h.out.gain.cancelScheduledValues(t);
  h.out.gain.setValueAtTime(h.out.gain.value, t);
  h.out.gain.linearRampToValueAtTime(0.0001, t + fadeOut);
  h.osc.stop(t + fadeOut + 0.05);
  h.air.stop(t + fadeOut + 0.05);
}

/** Gentle hum while the claw moves. `rising` lifts the pitch slightly. */
export function startHum(rising: boolean) {
  const a = audio();
  if (!a) return;
  stopHum();
  hum = startHumNodes(a, rising ? 165 : 147, 0.03, 0.2);
}

export function stopHum() {
  if (!hum || !ctx) return;
  fadeHum(ctx, hum, 0.25);
  hum = null;
}

export const sfx = {
  /** a soft little "whoosh" for one left/right step */
  move() {
    const a = audio();
    if (!a) return;
    const h = startHumNodes(a, 156, 0.025, 0.06);
    window.setTimeout(() => fadeHum(a, h, 0.15), 90);
  },
  /** classic two-note coin ding */
  coin() {
    tone({ freq: 988, dur: 0.08, type: "square", vol: 0.07 });
    tone({ freq: 1319, dur: 0.35, at: 0.08, type: "square", vol: 0.07 });
  },
  /** mechanical clunk as the claw closes */
  grab() {
    noise(0.08, 0, 0.15);
    tone({ freq: 160, to: 70, dur: 0.15, type: "triangle", vol: 0.2 });
  },
  /** gift lands in the prize chute */
  release() {
    tone({ freq: 700, to: 180, dur: 0.45, type: "square", vol: 0.05 });
    noise(0.06, 0.45, 0.12);
  },
  /** victory jingle when the quote is revealed */
  win() {
    const notes = [523, 659, 784, 1047, 784, 1047];
    notes.forEach((f, i) => tone({ freq: f, dur: 0.12, at: i * 0.09, type: "square", vol: 0.06 }));
    tone({ freq: 1568, dur: 0.4, at: notes.length * 0.09, type: "triangle", vol: 0.08 });
  },
  /** sad "womp womp" for a miss or slip */
  miss() {
    tone({ freq: 392, to: 370, dur: 0.25, type: "triangle", vol: 0.12 });
    tone({ freq: 349, to: 294, dur: 0.45, at: 0.28, type: "triangle", vol: 0.12 });
  },
  /** low buzz when trying to play without credits */
  denied() {
    tone({ freq: 110, dur: 0.12, type: "square", vol: 0.06 });
    tone({ freq: 110, dur: 0.18, at: 0.15, type: "square", vol: 0.06 });
  },
  click() {
    tone({ freq: 660, dur: 0.04, type: "square", vol: 0.03 });
  },
};
