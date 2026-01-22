/**
 * Game Boy APU Types
 */

export interface ChannelState {
  enabled: boolean;
  volume: number;      // 0-15
  frequency: number;   // Hz
  phase: number;
}

export interface PulseChannelState extends ChannelState {
  duty: number;        // 0-3 (12.5%, 25%, 50%, 75%)
}

export interface WaveChannelState extends ChannelState {
  waveData: number[];  // 32 samples, 0-15 each
  outputLevel: number; // 0-3
}

export interface NoiseChannelState extends ChannelState {
  lfsr: number;
  widthMode: number;   // 0: 15-bit, 1: 7-bit
  divisor: number;
  shiftClock: number;
}

export interface APUState {
  ch1: PulseChannelState;
  ch2: PulseChannelState;
  ch3: WaveChannelState;
  ch4: NoiseChannelState;
  masterVolume: number;
}

export type NoteCommand = {
  type: 'note';
  channel: number;
  note: string;
  octave: number;
  duration: number;  // in ticks
  volume?: number;
};

export type RestCommand = {
  type: 'rest';
  channel: number;
  duration: number;
};

export type TempoCommand = {
  type: 'tempo';
  bpm: number;
};

export type DutyCommand = {
  type: 'duty';
  channel: number;
  duty: number;
};

export type VolumeCommand = {
  type: 'volume';
  channel: number;
  volume: number;
};

export type OctaveCommand = {
  type: 'octave';
  channel: number;
  octave: number;
};

export type WaveCommand = {
  type: 'wave';
  channel: number;
  preset: string;
};

export type NoiseCommand = {
  type: 'noise';
  channel: number;
  mode: number;
};

export type MMLCommand =
  | NoteCommand
  | RestCommand
  | TempoCommand
  | DutyCommand
  | VolumeCommand
  | OctaveCommand
  | WaveCommand
  | NoiseCommand;

export interface MMLTrack {
  channel: number;
  commands: MMLCommand[];
}

export interface ParsedMML {
  tracks: MMLTrack[];
  tempo: number;
}
