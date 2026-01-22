/**
 * MML Parser
 *
 * MML (Music Macro Language) を解析してコマンドシーケンスに変換
 *
 * サポートするコマンド:
 * - C D E F G A B : 音符 (+ # - でシャープ/フラット)
 * - R : 休符
 * - O<n> : オクターブ設定
 * - > : オクターブ上げ
 * - < : オクターブ下げ
 * - L<n> : デフォルト音長
 * - T<n> : テンポ (BPM)
 * - V<n> : 音量 (0-15)
 * - @<n> : デューティ/波形設定
 * - & : タイ
 * - . : 付点
 * - $ : ループポイント（ループ再生時にここに戻る）
 */

export interface NoteEvent {
  type: 'note';
  note: string;      // 'c', 'c+', 'd', etc.
  octave: number;
  duration: number;  // in ticks (96 = 全音符)
  volume: number;
  duty?: number;
}

export interface RestEvent {
  type: 'rest';
  duration: number;
}

export interface TempoEvent {
  type: 'tempo';
  bpm: number;
}

export interface VolumeEvent {
  type: 'volume';
  volume: number;
}

export interface DutyEvent {
  type: 'duty';
  duty: number;
}

export interface WaveEvent {
  type: 'wave';
  preset: string;
}

export interface LoopPointEvent {
  type: 'looppoint';
}

export type MMLEvent = NoteEvent | RestEvent | TempoEvent | VolumeEvent | DutyEvent | WaveEvent | LoopPointEvent;

export interface ParsedTrack {
  channel: number;
  events: MMLEvent[];
}

export interface ParsedMML {
  tracks: ParsedTrack[];
  globalTempo: number;
}

const TICKS_PER_WHOLE_NOTE = 96;

export class MMLParser {
  private pos: number = 0;
  private text: string = '';
  private currentOctave: number = 4;
  private defaultLength: number = 4;  // 4分音符
  private currentVolume: number = 15;
  private currentDuty: number = 2;

  parse(mml: string): ParsedMML {
    const tracks: ParsedTrack[] = [];
    let globalTempo = 120;

    // トラックを分離（A: B: C: D: または CH1: CH2: CH3: CH4:）
    const trackRegex = /(?:^|\n)\s*(?:([ABCD])|CH([1-4]))\s*:/gi;
    const trackMatches: { channel: number; start: number }[] = [];

    let match;
    while ((match = trackRegex.exec(mml)) !== null) {
      const channel = match[1]
        ? match[1].toUpperCase().charCodeAt(0) - 64  // A=1, B=2, C=3, D=4
        : parseInt(match[2]);
      trackMatches.push({ channel, start: match.index + match[0].length });
    }

    // トラックがない場合、全体を1トラックとして扱う
    if (trackMatches.length === 0) {
      const events = this.parseTrack(mml);
      // グローバルテンポを抽出
      for (const event of events) {
        if (event.type === 'tempo') {
          globalTempo = event.bpm;
          break;
        }
      }
      tracks.push({ channel: 1, events });
    } else {
      // 各トラックをパース
      for (let i = 0; i < trackMatches.length; i++) {
        const start = trackMatches[i].start;
        const end = i < trackMatches.length - 1
          ? mml.lastIndexOf('\n', trackMatches[i + 1].start)
          : mml.length;

        const trackMML = mml.slice(start, end);
        this.resetState();
        const events = this.parseTrack(trackMML);

        // グローバルテンポを抽出（最初に見つかったもの）
        for (const event of events) {
          if (event.type === 'tempo' && globalTempo === 120) {
            globalTempo = event.bpm;
          }
        }

        tracks.push({ channel: trackMatches[i].channel, events });
      }
    }

    return { tracks, globalTempo };
  }

  private resetState(): void {
    this.currentOctave = 4;
    this.defaultLength = 4;
    this.currentVolume = 15;
    this.currentDuty = 2;
  }

  private parseTrack(mml: string): MMLEvent[] {
    this.pos = 0;
    this.text = mml.replace(/;.*$/gm, '').replace(/\/\/.*$/gm, '');  // コメント除去
    const events: MMLEvent[] = [];

    while (this.pos < this.text.length) {
      const char = this.text[this.pos].toLowerCase();

      if (/\s/.test(char)) {
        this.pos++;
        continue;
      }

      switch (char) {
        case 'c':
        case 'd':
        case 'e':
        case 'f':
        case 'g':
        case 'a':
        case 'b':
          events.push(this.parseNote(char));
          break;

        case 'r':
          events.push(this.parseRest());
          break;

        case 'o':
          this.pos++;
          this.currentOctave = this.parseNumber(4);
          break;

        case '>':
          this.pos++;
          this.currentOctave = Math.min(8, this.currentOctave + 1);
          break;

        case '<':
          this.pos++;
          this.currentOctave = Math.max(1, this.currentOctave - 1);
          break;

        case 'l':
          this.pos++;
          this.defaultLength = this.parseNumber(4);
          break;

        case 't':
          this.pos++;
          const bpm = this.parseNumber(120);
          events.push({ type: 'tempo', bpm });
          break;

        case 'v':
          this.pos++;
          this.currentVolume = Math.min(15, Math.max(0, this.parseNumber(15)));
          events.push({ type: 'volume', volume: this.currentVolume });
          break;

        case '@':
          this.pos++;
          const dutyOrWave = this.parseNumber(2);
          if (dutyOrWave >= 0 && dutyOrWave <= 3) {
            this.currentDuty = dutyOrWave;
            events.push({ type: 'duty', duty: dutyOrWave });
          }
          break;

        case 'w':
          // 波形プリセット: w0=triangle, w1=sawtooth, w2=square, w3=sine, w4=bass
          this.pos++;
          const presetNum = this.parseNumber(0);
          const presets = ['triangle', 'sawtooth', 'square', 'sine', 'bass'];
          events.push({ type: 'wave', preset: presets[presetNum] || 'triangle' });
          break;

        case '&':
          // タイ（次の音符と結合）- 現在は無視
          this.pos++;
          break;

        case '$':
          // ループポイント（ループ再生時にここに戻る）
          this.pos++;
          events.push({ type: 'looppoint' });
          break;

        default:
          this.pos++;
          break;
      }
    }

    return events;
  }

  private parseNote(noteName: string): NoteEvent {
    this.pos++;  // 音名をスキップ

    // シャープ/フラットを確認
    let note = noteName;
    if (this.pos < this.text.length) {
      const modifier = this.text[this.pos];
      if (modifier === '+' || modifier === '#') {
        note = noteName + '+';
        this.pos++;
      } else if (modifier === '-') {
        // フラットを半音下げた音に変換
        const noteMap: Record<string, string> = {
          'c': 'b', 'd': 'c+', 'e': 'd+', 'f': 'e', 'g': 'f+', 'a': 'g+', 'b': 'a+'
        };
        note = noteMap[noteName] || noteName;
        if (noteName === 'c') {
          this.currentOctave = Math.max(1, this.currentOctave - 1);
        }
        this.pos++;
      }
    }

    // 音長を解析
    let length = this.parseNumber(this.defaultLength);
    let duration = TICKS_PER_WHOLE_NOTE / length;

    // 付点を確認
    while (this.pos < this.text.length && this.text[this.pos] === '.') {
      duration = Math.floor(duration * 1.5);
      this.pos++;
    }

    return {
      type: 'note',
      note,
      octave: this.currentOctave,
      duration,
      volume: this.currentVolume,
      duty: this.currentDuty,
    };
  }

  private parseRest(): RestEvent {
    this.pos++;  // 'r' をスキップ

    let length = this.parseNumber(this.defaultLength);
    let duration = TICKS_PER_WHOLE_NOTE / length;

    // 付点を確認
    while (this.pos < this.text.length && this.text[this.pos] === '.') {
      duration = Math.floor(duration * 1.5);
      this.pos++;
    }

    return { type: 'rest', duration };
  }

  private parseNumber(defaultValue: number): number {
    let numStr = '';
    while (this.pos < this.text.length && /\d/.test(this.text[this.pos])) {
      numStr += this.text[this.pos];
      this.pos++;
    }
    return numStr.length > 0 ? parseInt(numStr, 10) : defaultValue;
  }
}

export function parseMML(mml: string): ParsedMML {
  const parser = new MMLParser();
  return parser.parse(mml);
}
