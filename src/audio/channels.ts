/**
 * Game Boy Sound Channels
 *
 * CH1: パルス波（スイープ機能付き）
 * CH2: パルス波
 * CH3: 波形メモリ
 * CH4: ノイズ
 */

/**
 * パルス波チャンネル (CH1, CH2)
 * デューティ比: 12.5%, 25%, 50%, 75%
 */
export class PulseChannel {
  private sampleRate: number;
  private phase: number = 0;
  private _frequency: number = 440;
  private _volume: number = 15;
  private _duty: number = 2;
  private _enabled: boolean = false;

  // デューティ比テーブル
  private static readonly DUTY_TABLE: Record<number, number> = {
    0: 0.125,  // 12.5%
    1: 0.25,   // 25%
    2: 0.5,    // 50%
    3: 0.75,   // 75%
  };

  constructor(sampleRate: number = 44100) {
    this.sampleRate = sampleRate;
  }

  get frequency(): number { return this._frequency; }
  set frequency(value: number) { this._frequency = Math.max(20, Math.min(value, 20000)); }

  get volume(): number { return this._volume; }
  set volume(value: number) { this._volume = Math.max(0, Math.min(value, 15)); }

  get duty(): number { return this._duty; }
  set duty(value: number) { this._duty = Math.max(0, Math.min(value, 3)); }

  get enabled(): boolean { return this._enabled; }
  set enabled(value: boolean) { this._enabled = value; }

  noteOn(frequency: number, volume?: number): void {
    this.frequency = frequency;
    if (volume !== undefined) {
      this.volume = volume;
    }
    this._enabled = true;
    this.phase = 0;
  }

  noteOff(): void {
    this._enabled = false;
  }

  generate(numSamples: number): Float32Array {
    const samples = new Float32Array(numSamples);

    if (!this._enabled || this._volume === 0) {
      return samples;
    }

    const dutyRatio = PulseChannel.DUTY_TABLE[this._duty];
    const phaseIncrement = this._frequency / this.sampleRate;
    const volumeScale = this._volume / 15;

    for (let i = 0; i < numSamples; i++) {
      // パルス波生成
      samples[i] = (this.phase < dutyRatio ? 1 : -1) * volumeScale * 0.25;

      this.phase += phaseIncrement;
      if (this.phase >= 1) {
        this.phase -= 1;
      }
    }

    return samples;
  }

  reset(): void {
    this.phase = 0;
    this._enabled = false;
  }
}

/**
 * 波形メモリチャンネル (CH3)
 * 32サンプルの4bitカスタム波形
 */
export class WaveChannel {
  private sampleRate: number;
  private position: number = 0;
  private _frequency: number = 440;
  private _volume: number = 15;
  private _outputLevel: number = 1;  // 0-3
  private _enabled: boolean = false;
  private _waveData: number[];

  // プリセット波形
  static readonly WAVE_PRESETS: Record<string, number[]> = {
    triangle: [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
      15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0
    ],
    sawtooth: [
      0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7,
      8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15
    ],
    square: [
      15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ],
    sine: Array.from({ length: 32 }, (_, i) =>
      Math.round((Math.sin(2 * Math.PI * i / 32) + 1) * 7.5)
    ),
    bass: [
      15, 15, 14, 13, 12, 10, 8, 6, 4, 3, 2, 1, 1, 0, 0, 0,
      0, 0, 0, 1, 1, 2, 3, 4, 6, 8, 10, 12, 13, 14, 15, 15
    ],
  };

  constructor(sampleRate: number = 44100) {
    this.sampleRate = sampleRate;
    this._waveData = [...WaveChannel.WAVE_PRESETS.triangle];
  }

  get frequency(): number { return this._frequency; }
  set frequency(value: number) { this._frequency = Math.max(20, Math.min(value, 20000)); }

  get volume(): number { return this._volume; }
  set volume(value: number) { this._volume = Math.max(0, Math.min(value, 15)); }

  get outputLevel(): number { return this._outputLevel; }
  set outputLevel(value: number) { this._outputLevel = Math.max(0, Math.min(value, 3)); }

  get enabled(): boolean { return this._enabled; }
  set enabled(value: boolean) { this._enabled = value; }

  get waveData(): number[] { return this._waveData; }

  setWaveData(data: number[]): void {
    if (data.length === 32) {
      this._waveData = data.map(v => Math.max(0, Math.min(15, v)));
    }
  }

  setWavePreset(preset: string): void {
    if (preset in WaveChannel.WAVE_PRESETS) {
      this._waveData = [...WaveChannel.WAVE_PRESETS[preset]];
    }
  }

  noteOn(frequency: number, volume?: number): void {
    this.frequency = frequency;
    if (volume !== undefined) {
      this.volume = volume;
    }
    this._enabled = true;
    this.position = 0;
  }

  noteOff(): void {
    this._enabled = false;
  }

  generate(numSamples: number): Float32Array {
    const samples = new Float32Array(numSamples);

    if (!this._enabled || this._outputLevel === 0) {
      return samples;
    }

    const positionIncrement = (this._frequency * 32) / this.sampleRate;
    const shiftAmounts: Record<number, number> = { 0: 4, 1: 0, 2: 1, 3: 2 };
    const shift = shiftAmounts[this._outputLevel];
    const volumeScale = this._volume / 15;

    for (let i = 0; i < numSamples; i++) {
      const waveIndex = Math.floor(this.position) % 32;
      const sampleValue = this._waveData[waveIndex] >> shift;

      // 0-15 を -1.0 ~ 1.0 に変換
      samples[i] = ((sampleValue / 7.5) - 1) * volumeScale * 0.25;

      this.position += positionIncrement;
      if (this.position >= 32) {
        this.position -= 32;
      }
    }

    return samples;
  }

  reset(): void {
    this.position = 0;
    this._enabled = false;
  }
}

/**
 * ノイズチャンネル (CH4)
 * LFSR（Linear Feedback Shift Register）ベースのノイズ生成
 */
export class NoiseChannel {
  private sampleRate: number;
  private lfsr: number = 0x7FFF;
  private timer: number = 0;
  private _frequency: number = 440;
  private _volume: number = 15;
  private _widthMode: number = 0;  // 0: 15-bit, 1: 7-bit
  private _divisor: number = 8;
  private _shiftClock: number = 0;
  private _enabled: boolean = false;

  constructor(sampleRate: number = 44100) {
    this.sampleRate = sampleRate;
  }

  get volume(): number { return this._volume; }
  set volume(value: number) { this._volume = Math.max(0, Math.min(value, 15)); }

  get widthMode(): number { return this._widthMode; }
  set widthMode(value: number) { this._widthMode = value === 1 ? 1 : 0; }

  get enabled(): boolean { return this._enabled; }
  set enabled(value: boolean) { this._enabled = value; }

  setNoiseParams(shiftClock: number, widthMode: number, divisor: number): void {
    this._shiftClock = shiftClock;
    this._widthMode = widthMode;
    this._divisor = Math.max(1, divisor);
  }

  noteOn(frequency: number, volume?: number): void {
    // ノイズチャンネルでは周波数は直接使わないが、
    // MMLの音高に応じてノイズの特性を変える
    this._shiftClock = Math.max(0, Math.min(13, Math.floor(14 - (frequency / 100))));
    if (volume !== undefined) {
      this.volume = volume;
    }
    this._enabled = true;
    this.lfsr = 0x7FFF;
    this.timer = 0;
  }

  noteOff(): void {
    this._enabled = false;
  }

  private clockLFSR(): void {
    if (this._widthMode === 1) {
      // 7-bit mode
      const bit = (this.lfsr ^ (this.lfsr >> 1)) & 1;
      this.lfsr = ((this.lfsr >> 1) & 0x3F) | (bit << 6);
    } else {
      // 15-bit mode
      const bit = (this.lfsr ^ (this.lfsr >> 1)) & 1;
      this.lfsr = ((this.lfsr >> 1) & 0x3FFF) | (bit << 14);
    }
  }

  generate(numSamples: number): Float32Array {
    const samples = new Float32Array(numSamples);

    if (!this._enabled || this._volume === 0) {
      return samples;
    }

    // ノイズ周波数計算
    const baseFreq = 524288;
    const noiseFreq = baseFreq / this._divisor / (1 << (this._shiftClock + 1));
    const samplesPerShift = Math.max(1, Math.floor(this.sampleRate / noiseFreq));
    const volumeScale = this._volume / 15;

    for (let i = 0; i < numSamples; i++) {
      samples[i] = ((this.lfsr & 1) ? 1 : -1) * volumeScale * 0.2;

      this.timer++;
      if (this.timer >= samplesPerShift) {
        this.timer = 0;
        this.clockLFSR();
      }
    }

    return samples;
  }

  reset(): void {
    this.lfsr = 0x7FFF;
    this.timer = 0;
    this._enabled = false;
  }
}
