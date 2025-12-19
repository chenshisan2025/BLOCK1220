export type SoundId = "SFX_SWAP" | "SFX_INVALID_SWAP" | "SFX_TIMER_WARNING";

type Vol = { master: number; sfx: number; mute: boolean };

export class SoundManager {
  private static inst: SoundManager | null = null;
  static get() {
    return (this.inst ??= new SoundManager());
  }

  private ctx: AudioContext | null = null;
  private vol: Vol = { master: 0.9, sfx: 0.8, mute: false };
  private unlocked = false;

  private maxVoices = 6;
  private activeVoices = 0;
  private cooldownMs: Record<SoundId, number> = {
    SFX_SWAP: 80,
    SFX_INVALID_SWAP: 120,
    SFX_TIMER_WARNING: 250,
  };
  private lastAt: Partial<Record<SoundId, number>> = {};

  private constructor() {}

  initOnFirstGesture() {
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (this.ctx.state === "suspended") {
      const p = this.ctx.resume();
      if (typeof (p as any)?.then === "function") {
        (p as Promise<void>).then(() => {
          this.unlocked = this.ctx?.state === "running";
        });
      } else {
        this.unlocked = true;
      }
    } else {
      this.unlocked = true;
    }
  }

  isUnlocked() {
    return this.unlocked && !!this.ctx && this.ctx.state === "running";
  }

  playSfx(id: SoundId) {
    if (this.vol.mute) return;
    const now = performance.now();
    const last = this.lastAt[id] ?? 0;
    if (now - last < (this.cooldownMs[id] ?? 80)) return;
    if (this.activeVoices >= this.maxVoices) return;
    this.lastAt[id] = now;

    this.ensureCtx();
    if (!this.ctx) return;

    this.activeVoices++;
    this.synth(id).finally(() => {
      this.activeVoices = Math.max(0, this.activeVoices - 1);
    });
  }

  private ensureCtx() {
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  private async synth(id: SoundId) {
    const ctx = this.ctx!;
    const t0 = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    gain.gain.setValueAtTime(0.0001, t0);
    const out = 0.25 * this.vol.master * this.vol.sfx;
    gain.gain.exponentialRampToValueAtTime(out, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.15);

    if (id === "SFX_SWAP") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, t0);
      osc.frequency.linearRampToValueAtTime(520, t0 + 0.08);
    } else if (id === "SFX_INVALID_SWAP") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, t0);
      osc.frequency.linearRampToValueAtTime(140, t0 + 0.12);
    } else {
      osc.type = "square";
      osc.frequency.setValueAtTime(800, t0);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t0);
    osc.stop(t0 + 0.16);

    await new Promise((r) => setTimeout(r, 180));
  }
}
