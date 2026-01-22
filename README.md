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

MMLの詳細な仕様は [MML仕様書](docs/MML_SPEC.md) を参照してください。

### クイックリファレンス

| コマンド | 説明 |
|---------|------|
| `A:` `B:` `C:` `D:` | チャンネル指定 (CH1-4) |
| `C D E F G A B` | 音符 |
| `+ #` `-` | シャープ / フラット |
| `R` | 休符 |
| `O<n>` `>` `<` | オクターブ |
| `L<n>` | デフォルト音長 |
| `T<n>` | テンポ (BPM) |
| `V<n>` | 音量 (0-15) |
| `@<n>` | デューティ比 (0-3) |
| `W<n>` | 波形プリセット |

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
