/**
 * Game Boy APU (Audio Processing Unit)
 *
 * 4つのサウンドチャンネルを管理し、Web Audio APIと連携
 */

import { PulseChannel, WaveChannel, NoiseChannel } from './channels';

// 音階の周波数テーブル (A4 = 440Hz)
const NOTE_FREQUENCIES: Record<string, Record<number, number>> = {};

function initNoteFrequencies(): void {
  if (Object.keys(NOTE_FREQUENCIES).length > 0) return;

  const noteNames = ['c', 'c+', 'd', 'd+', 'e', 'f', 'f+', 'g', 'g+', 'a', 'a+', 'b'];

  for (let octave = 1; octave <= 8; octave++) {
    for (let i = 0; i < noteNames.length; i++) {
      const note = noteNames[i];
      // A4からの半音数を計算
      const semitonesFromA4 = (octave - 4) * 12 + (i - 9);
      const freq = 440 * Math.pow(2, semitonesFromA4 / 12);

      if (!NOTE_FREQUENCIES[note]) {
        NOTE_FREQUENCIES[note] = {};
      }
      NOTE_FREQUENCIES[note][octave] = freq;
    }
  }
}

initNoteFrequencies();

export class GameBoyAPU {
  private audioContext: AudioContext | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private gainNode: GainNode | null = null;

  readonly ch1: PulseChannel;
  readonly ch2: PulseChannel;
  readonly ch3: WaveChannel;
  readonly ch4: NoiseChannel;

  private _masterVolume: number = 0.5;
  private channelEnabled: boolean[] = [true, true, true, true];
  private isPlaying: boolean = false;

  constructor() {
    this.ch1 = new PulseChannel();
    this.ch2 = new PulseChannel();
    this.ch3 = new WaveChannel();
    this.ch4 = new NoiseChannel();
  }

  get masterVolume(): number { return this._masterVolume; }
  set masterVolume(value: number) {
    this._masterVolume = Math.max(0, Math.min(value, 1));
    if (this.gainNode) {
      this.gainNode.gain.value = this._masterVolume;
    }
  }

  getChannel(channelNum: number): PulseChannel | WaveChannel | NoiseChannel | null {
    switch (channelNum) {
      case 1: return this.ch1;
      case 2: return this.ch2;
      case 3: return this.ch3;
      case 4: return this.ch4;
      default: return null;
    }
  }

  noteToFrequency(note: string, octave: number): number {
    const noteLower = note.toLowerCase();
    return NOTE_FREQUENCIES[noteLower]?.[octave] ?? 440;
  }

  enableChannel(channelNum: number, enabled: boolean): void {
    if (channelNum >= 1 && channelNum <= 4) {
      this.channelEnabled[channelNum - 1] = enabled;
    }
  }

  isChannelEnabled(channelNum: number): boolean {
    if (channelNum >= 1 && channelNum <= 4) {
      return this.channelEnabled[channelNum - 1];
    }
    return false;
  }

  async start(): Promise<void> {
    if (this.isPlaying) return;

    this.audioContext = new AudioContext({ sampleRate: 44100 });
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this._masterVolume;
    this.gainNode.connect(this.audioContext.destination);

    // 各チャンネルのサンプルレートを設定
    const sampleRate = this.audioContext.sampleRate;
    this.ch1 = new PulseChannel(sampleRate);
    this.ch2 = new PulseChannel(sampleRate);
    (this.ch3 as { sampleRate: number }).sampleRate = sampleRate;
    (this.ch4 as { sampleRate: number }).sampleRate = sampleRate;

    // ScriptProcessorNodeを使用（AudioWorkletよりシンプル）
    const bufferSize = 2048;
    this.scriptProcessor = this.audioContext.createScriptProcessor(bufferSize, 0, 1);

    this.scriptProcessor.onaudioprocess = (event) => {
      const output = event.outputBuffer.getChannelData(0);
      this.generateSamples(output);
    };

    this.scriptProcessor.connect(this.gainNode);
    this.isPlaying = true;
  }

  stop(): void {
    if (!this.isPlaying) return;

    this.allNotesOff();

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isPlaying = false;
  }

  private generateSamples(output: Float32Array): void {
    const numSamples = output.length;

    // 各チャンネルの出力を生成
    const ch1Samples = this.channelEnabled[0] ? this.ch1.generate(numSamples) : new Float32Array(numSamples);
    const ch2Samples = this.channelEnabled[1] ? this.ch2.generate(numSamples) : new Float32Array(numSamples);
    const ch3Samples = this.channelEnabled[2] ? this.ch3.generate(numSamples) : new Float32Array(numSamples);
    const ch4Samples = this.channelEnabled[3] ? this.ch4.generate(numSamples) : new Float32Array(numSamples);

    // ミックス
    for (let i = 0; i < numSamples; i++) {
      let sample = ch1Samples[i] + ch2Samples[i] + ch3Samples[i] + ch4Samples[i];
      // クリッピング防止
      output[i] = Math.max(-1, Math.min(1, sample));
    }
  }

  allNotesOff(): void {
    this.ch1.noteOff();
    this.ch2.noteOff();
    this.ch3.noteOff();
    this.ch4.noteOff();
  }

  reset(): void {
    this.ch1.reset();
    this.ch2.reset();
    this.ch3.reset();
    this.ch4.reset();
  }

  get playing(): boolean {
    return this.isPlaying;
  }
}
