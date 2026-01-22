/**
 * Sample MML Data
 */

export const SAMPLE_MML = {
  // きらきら星
  twinkleStar: `; Twinkle Twinkle Little Star
; ゲームボーイ風アレンジ

A: T100 @2 V12 O4 L4
   CCGGAAG2 FFEEDDC2
   GGFFEED2 GGFFEED2
   CCGGAAG2 FFEEDDC2

B: T100 @1 V8 O3 L4
   E2G2C2E2 D2F2E2C2
   E2D2C2B-2 E2D2C2B-2
   E2G2C2E2 D2F2E2C2
`,

  // カエルの歌
  frogSong: `; Frog Song (Kaeru no Uta)
; 輪唱風アレンジ

A: T120 @2 V12 O4 L8
   CDEF EDC2 EFGA GAF2
   C4C4 C4C4 C4C4 C4C4
   CDCD EFEF GAGF EDC2

B: T120 @1 V10 O4 L8
   R1 R1
   CDEF EDC2 EFGA GAF2
   C4C4 C4C4 C4C4 C4C4

C: T120 W0 V10 O3 L4
   C2E2 G2E2 F2A2 G2C2
   C2E2 G2E2 F2A2 G2C2
   C2E2 G2E2 C2R2

D: T120 V6 O2 L2
   R1 R1 R1 R1
   CCCC CCCC CCCC CC
`,

  // オリジナルメロディ
  original: `; Original Chiptune
; 4チャンネル使用

A: T140 @2 V12 O4 L8
   EG>C<B AG E4
   DC<A>C <G4 R4
   EG>C<B AG E4
   DC<BA G4 R4
   >C<BAG E4 D4
   CDEF G4 A4
   G2 E2 C4 R4

B: T140 @1 V10 O3 L8
   C4E4 G4E4
   F4A4 E4C4
   C4E4 G4E4
   F4D4 C4R4
   E4G4 C4<A4
   G4>C4 E4C4
   E2 C2 <G4 R4

C: T140 W3 V12 O3 L4
   C2 G2 A2 G2
   C2 G2 A2 G2
   C2 G2 A2 G2
   C2 <G2 >C2 R2

D: T140 V8 O2 L4
   C R E R G R E R
   F R A R E R C R
   C R E R G R E R
   F R D R C2 R2
`,

  // スケール練習
  scale: `; Scale Practice
; 各チャンネルの音色確認用

A: T90 @2 V15 O4 L8
   CDEFGAB>C<BAGFEDC2

B: T90 @0 V12 O4 L8
   R2 CDEFGAB>C<BAGFEDC2

C: T90 W0 V12 O3 L8
   R1 CDEFGAB>C<BAGFEDC2

D: T90 V10 O2 L8
   R1 R2 CDEFGAB>C2
`,

  // ゲームボーイ風BGM
  gameBgm: `; Game Boy Style BGM
; 冒険のテーマ

A: T150 @2 V14 O5 L8
   C4<G>C E4DE C4<GA
   B4AB >C4<B>C D4R4
   C4<G>C E4DE C4<GA
   B4>CD <A4GF E4R4

B: T150 @1 V10 O4 L8
   E4CE G4FG E4CD
   D4GD F4EF E4R4
   E4CE G4FG E4CD
   D4EF D4C<B >C4R4

C: T150 W1 V12 O3 L4
   C2 G2 A2 E2
   G2 D2 F2 C2
   C2 G2 A2 E2
   G2 F2 C2 R2

D: T150 V6 O3 L8
   CR CR CR CR CR CR CR CR
   CR CR CR CR CR CR CR CR
   CR CR CR CR CR CR CR CR
   CR CR CR CR C4 R4
`,

  // シンプルテスト
  simple: `; Simple Test
; 基本動作確認用

A: T120 @2 V15 O4 L4
   C D E F G A B >C
`,
};

export const SAMPLE_LIST = [
  { name: 'Twinkle Star', mml: SAMPLE_MML.twinkleStar },
  { name: 'Frog Song', mml: SAMPLE_MML.frogSong },
  { name: 'Original Chiptune', mml: SAMPLE_MML.original },
  { name: 'Scale Practice', mml: SAMPLE_MML.scale },
  { name: 'Game BGM', mml: SAMPLE_MML.gameBgm },
  { name: 'Simple Test', mml: SAMPLE_MML.simple },
];
