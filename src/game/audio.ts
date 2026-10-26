export class CityAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private bedGain: GainNode | null = null;
  private stepPhase = 0;
  muted = false;

  unlock() {
    if (!this.ctx) {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = 0.22;
      master.connect(ctx.destination);

      const bed = ctx.createOscillator();
      bed.type = "sine";
      bed.frequency.value = 82;
      const bedFilter = ctx.createBiquadFilter();
      bedFilter.type = "lowpass";
      bedFilter.frequency.value = 220;
      const bedGain = ctx.createGain();
      bedGain.gain.value = 0.08;
      bed.connect(bedFilter);
      bedFilter.connect(bedGain);
      bedGain.connect(master);
      bed.start();

      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;
      noise.loop = true;
      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = "highpass";
      rainFilter.frequency.value = 700;
      const rainGain = ctx.createGain();
      rainGain.gain.value = 0;
      noise.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(master);
      noise.start();

      const engineOsc = ctx.createOscillator();
      engineOsc.type = "sawtooth";
      engineOsc.frequency.value = 70;
      const engineFilter = ctx.createBiquadFilter();
      engineFilter.type = "lowpass";
      engineFilter.frequency.value = 420;
      const engineGain = ctx.createGain();
      engineGain.gain.value = 0;
      engineOsc.connect(engineFilter);
      engineFilter.connect(engineGain);
      engineGain.connect(master);
      engineOsc.start();

      this.ctx = ctx;
      this.master = master;
      this.engineOsc = engineOsc;
      this.engineGain = engineGain;
      this.rainGain = rainGain;
      this.bedGain = bedGain;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.22, this.ctx.currentTime, 0.05);
    }
  }

  update(
    dt: number,
    state: { driving: boolean; speed: number; raining: boolean; walking: boolean; market: number },
  ) {
    if (!this.ctx || !this.engineOsc || !this.engineGain || !this.rainGain || !this.bedGain) return;
    const now = this.ctx.currentTime;
    const drive = state.driving ? Math.min(1, Math.abs(state.speed) / 14) : 0;
    this.engineGain.gain.setTargetAtTime(state.driving ? 0.045 + drive * 0.08 : 0, now, 0.08);
    this.engineOsc.frequency.setTargetAtTime(68 + drive * 90 + (state.speed < 0 ? -12 : 0), now, 0.08);
    this.rainGain.gain.setTargetAtTime(state.raining ? 0.18 : 0, now, 0.4);
    this.bedGain.gain.setTargetAtTime(0.04 + state.market * 0.08 + (state.raining ? 0.02 : 0), now, 0.3);

    if (state.walking) {
      this.stepPhase += dt * (3.2 + Math.min(6, state.speed));
      if (this.stepPhase > 1) {
        this.stepPhase = 0;
        this.blip(180 + Math.random() * 80, 0.03, 0.04);
      }
    } else this.stepPhase = 0;
  }

  horn() {
    this.blip(440, 0.09, 0.07, "square");
  }

  coin() {
    this.blip(520, 0.07, 0.05);
    window.setTimeout(() => this.blip(780, 0.1, 0.05), 90);
  }

  thud() {
    this.blip(90, 0.12, 0.08, "triangle");
  }

  private blip(freq: number, dur: number, gain: number, type: OscillatorType = "sine") {
    if (!this.ctx || !this.master || this.muted) return;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.value = gain;
    osc.connect(amp);
    amp.connect(this.master);
    osc.start();
    amp.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
    osc.stop(this.ctx.currentTime + dur + 0.02);
  }

  dispose() {
    void this.ctx?.close();
    this.ctx = null;
  }
}
