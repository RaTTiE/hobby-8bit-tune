# Game Boy MML Player

ゲームボーイの音源をエミュレートし、MML (Music Macro Language) で曲を作成・再生できるWebアプリケーションです。

## Features

- **ゲームボーイ音源エミュレーション**
  - CH1: パルス波（スイープ機能付き）- デューティ比 12.5%, 25%, 50%, 75%
  - CH2: パルス波 - デューティ比 12.5%, 25%, 50%, 75%
  - CH3: 波形メモリ - カスタム波形（三角波、ノコギリ波、矩形波、サイン波、ベース）
  - CH4: ノイズ - LFSR (Linear Feedback Shift Register) ベース

- **MMLエディタ**
  - シンタックスハイライト付きエディタ
  - リアルタイムプレビュー

- **プレイヤー機能**
  - 再生/一時停止/停止
  - シーク機能
  - ループ再生
  - チャンネルミキサー（各チャンネルのON/OFF）
  - マスターボリューム調整

## MML Reference

### チャンネル指定

```
A: または CH1:  ; パルス波チャンネル1
B: または CH2:  ; パルス波チャンネル2
C: または CH3:  ; 波形メモリチャンネル
D: または CH4:  ; ノイズチャンネル
```

### コマンド

| コマンド | 説明 | 例 |
|---------|------|-----|
| `C D E F G A B` | 音符 | `CDEFGAB` |
| `+ #` | シャープ | `C+ D#` |
| `-` | フラット | `D- E-` |
| `R` | 休符 | `R4` |
| `O<n>` | オクターブ設定 (1-8) | `O4` |
| `>` | オクターブ上げ | `C>C` |
| `<` | オクターブ下げ | `C<C` |
| `L<n>` | デフォルト音長 | `L8` |
| `T<n>` | テンポ (BPM) | `T120` |
| `V<n>` | 音量 (0-15) | `V12` |
| `@<n>` | デューティ比 (0-3) | `@2` |
| `W<n>` | 波形プリセット (CH3用) | `W0` |
| `.` | 付点 | `C4.` |

### 音長

- `1` = 全音符
- `2` = 2分音符
- `4` = 4分音符
- `8` = 8分音符
- `16` = 16分音符

### デューティ比 (@コマンド、CH1/CH2)

- `@0` = 12.5%
- `@1` = 25%
- `@2` = 50%
- `@3` = 75%

### 波形プリセット (Wコマンド、CH3)

- `W0` = 三角波
- `W1` = ノコギリ波
- `W2` = 矩形波
- `W3` = サイン波
- `W4` = ベース

## Example MML

```
; きらきら星

A: T100 @2 V12 O4 L4
   CCGGAAG2 FFEEDDC2
   GGFFEED2 GGFFEED2
   CCGGAAG2 FFEEDDC2

B: T100 @1 V8 O3 L4
   E2G2C2E2 D2F2E2C2
   E2D2C2B-2 E2D2C2B-2
   E2G2C2E2 D2F2E2C2
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- React 18
- TypeScript
- Vite
- Web Audio API

## License

MIT
