/**
 * MML Player
 *
 * 解析されたMMLを再生するプレイヤー
 */

import { GameBoyAPU } from '../audio/apu';
import { PulseChannel, WaveChannel } from '../audio/channels';
import { parseMML, MMLEvent, ParsedMML } from './parser';

interface TrackState {
  channel: number;
  events: MMLEvent[];
  eventIndex: number;
  ticksUntilNext: number;
  currentDuty: number;
  currentVolume: number;
  loopPointIndex: number;  // ループポイントのイベントインデックス（0=最初から）
}

export type PlayerState = 'stopped' | 'playing' | 'paused';

export type PlayerCallback = (state: PlayerState, position: number, duration: number) => void;

export class MMLPlayer {
  private apu: GameBoyAPU;
  private tracks: TrackState[] = [];
  private tempo: number = 120;
  private ticksPerSecond: number = 0;
  private tickInterval: number | null = null;
  private currentTick: number = 0;
  private totalTicks: number = 0;
  private _state: PlayerState = 'stopped';
  private callback: PlayerCallback | null = null;
  private looping: boolean = false;

  constructor() {
    this.apu = new GameBoyAPU();
    this.updateTicksPerSecond();
  }

  get state(): PlayerState {
    return this._state;
  }

  get position(): number {
    return this.currentTick;
  }

  get duration(): number {
    return this.totalTicks;
  }

  get currentTempo(): number {
    return this.tempo;
  }

  setCallback(callback: PlayerCallback | null): void {
    this.callback = callback;
  }

  setLooping(loop: boolean): void {
    this.looping = loop;
  }

  private updateTicksPerSecond(): void {
    // 1分間にtempo回の4分音符
    // 4分音符 = 24 ticks
    // ticksPerSecond = (tempo * 24) / 60
    this.ticksPerSecond = (this.tempo * 24) / 60;
  }

  private notifyCallback(): void {
    if (this.callback) {
      this.callback(this._state, this.currentTick, this.totalTicks);
    }
  }

  load(mml: string): void {
    this.stop();
    const parsed = parseMML(mml);

    this.tempo = parsed.globalTempo;
    this.updateTicksPerSecond();

    this.tracks = parsed.tracks.map(track => ({
      channel: track.channel,
      events: track.events,
      eventIndex: 0,
      ticksUntilNext: 0,
      currentDuty: 2,
      currentVolume: 15,
      loopPointIndex: 0,
    }));

    // 総再生時間を計算
    this.totalTicks = this.calculateTotalTicks(parsed);
    this.currentTick = 0;
    this.notifyCallback();
  }

  private calculateTotalTicks(parsed: ParsedMML): number {
    let maxTicks = 0;

    for (const track of parsed.tracks) {
      let ticks = 0;
      for (const event of track.events) {
        if (event.type === 'note' || event.type === 'rest') {
          ticks += event.duration;
        }
      }
      maxTicks = Math.max(maxTicks, ticks);
    }

    return maxTicks;
  }

  private calculateLoopPointTick(): number {
    // 全トラックのループポイントまでのtickを計算し、最大値を返す
    let maxTicks = 0;

    for (const track of this.tracks) {
      let ticks = 0;
      for (let i = 0; i < track.loopPointIndex && i < track.events.length; i++) {
        const event = track.events[i];
        if (event.type === 'note' || event.type === 'rest') {
          ticks += event.duration;
        }
      }
      maxTicks = Math.max(maxTicks, ticks);
    }

    return maxTicks;
  }

  async play(): Promise<void> {
    if (this._state === 'playing') return;

    if (this._state === 'stopped') {
      // 最初からまたはリセット後の再生
      this.currentTick = 0;
      this.tracks.forEach(track => {
        track.eventIndex = 0;
        track.ticksUntilNext = 0;
        track.currentDuty = 2;
        track.currentVolume = 15;
      });
    }

    await this.apu.start();
    this._state = 'playing';

    // タイマーで定期的にtickを処理
    const msPerTick = 1000 / this.ticksPerSecond;
    this.tickInterval = window.setInterval(() => {
      this.processTick();
    }, msPerTick);

    this.notifyCallback();
  }

  pause(): void {
    if (this._state !== 'playing') return;

    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    this.apu.allNotesOff();
    this._state = 'paused';
    this.notifyCallback();
  }

  stop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    this.apu.stop();
    this.currentTick = 0;
    this.tracks.forEach(track => {
      track.eventIndex = 0;
      track.ticksUntilNext = 0;
    });

    this._state = 'stopped';
    this.notifyCallback();
  }

  seek(tick: number): void {
    // シークは簡易実装：最初から指定位置まで早送り
    const wasPlaying = this._state === 'playing';
    this.pause();

    this.currentTick = 0;
    this.tracks.forEach(track => {
      track.eventIndex = 0;
      track.ticksUntilNext = 0;
    });

    // 指定位置までスキップ
    while (this.currentTick < tick && this.hasMoreEvents()) {
      this.processTickSilent();
    }

    if (wasPlaying) {
      this.play();
    }

    this.notifyCallback();
  }

  private hasMoreEvents(): boolean {
    return this.tracks.some(track => track.eventIndex < track.events.length);
  }

  private processTick(): void {
    if (!this.hasMoreEvents()) {
      if (this.looping) {
        // ループ再生：ループポイントに戻る
        this.currentTick = this.calculateLoopPointTick();
        this.tracks.forEach(track => {
          track.eventIndex = track.loopPointIndex;
          track.ticksUntilNext = 0;
        });
      } else {
        this.stop();
        return;
      }
    }

    // 各トラックを処理
    for (const track of this.tracks) {
      this.processTrackTick(track);
    }

    this.currentTick++;
    this.notifyCallback();
  }

  private processTickSilent(): void {
    // 音を出さずにtickを進める（シーク用）
    for (const track of this.tracks) {
      while (track.ticksUntilNext <= 0 && track.eventIndex < track.events.length) {
        const event = track.events[track.eventIndex];

        if (event.type === 'note' || event.type === 'rest') {
          track.ticksUntilNext = event.duration;
        }

        if (event.type === 'tempo') {
          this.tempo = event.bpm;
          this.updateTicksPerSecond();
        }

        if (event.type === 'looppoint') {
          track.loopPointIndex = track.eventIndex + 1;
        }

        track.eventIndex++;
      }

      if (track.ticksUntilNext > 0) {
        track.ticksUntilNext--;
      }
    }

    this.currentTick++;
  }

  private processTrackTick(track: TrackState): void {
    // 待機中のイベントをスキップ
    while (track.ticksUntilNext <= 0 && track.eventIndex < track.events.length) {
      const event = track.events[track.eventIndex];
      const channel = this.apu.getChannel(track.channel);

      switch (event.type) {
        case 'note':
          if (channel) {
            const freq = this.apu.noteToFrequency(event.note, event.octave);

            // チャンネルタイプに応じた設定
            if (channel instanceof PulseChannel) {
              channel.duty = track.currentDuty;
            } else if (channel instanceof WaveChannel) {
              channel.outputLevel = 1;
            }

            channel.noteOn(freq, track.currentVolume);
          }
          track.ticksUntilNext = event.duration;
          break;

        case 'rest':
          if (channel) {
            channel.noteOff();
          }
          track.ticksUntilNext = event.duration;
          break;

        case 'tempo':
          this.tempo = event.bpm;
          this.updateTicksPerSecond();
          // タイマー間隔を更新
          if (this.tickInterval) {
            clearInterval(this.tickInterval);
            const msPerTick = 1000 / this.ticksPerSecond;
            this.tickInterval = window.setInterval(() => {
              this.processTick();
            }, msPerTick);
          }
          break;

        case 'volume':
          track.currentVolume = event.volume;
          break;

        case 'duty':
          track.currentDuty = event.duty;
          break;

        case 'wave':
          if (channel instanceof WaveChannel) {
            channel.setWavePreset(event.preset);
          }
          break;

        case 'looppoint':
          // ループポイントを記録（現在のインデックスの次の位置）
          track.loopPointIndex = track.eventIndex + 1;
          break;
      }

      track.eventIndex++;
    }

    // 音符の持続時間を減少
    if (track.ticksUntilNext > 0) {
      track.ticksUntilNext--;

      // 音符終了時にノートオフ
      if (track.ticksUntilNext === 0) {
        const channel = this.apu.getChannel(track.channel);
        if (channel) {
          channel.noteOff();
        }
      }
    }
  }

  setMasterVolume(volume: number): void {
    this.apu.masterVolume = volume;
  }

  enableChannel(channel: number, enabled: boolean): void {
    this.apu.enableChannel(channel, enabled);
  }

  isChannelEnabled(channel: number): boolean {
    return this.apu.isChannelEnabled(channel);
  }

  getAPU(): GameBoyAPU {
    return this.apu;
  }
}
