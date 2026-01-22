import { useState, useEffect, useRef } from 'react';
import { MMLEditor } from './components/MMLEditor';
import { PlayerControls } from './components/PlayerControls';
import { ChannelMixer } from './components/ChannelMixer';
import { SampleSelector } from './components/SampleSelector';
import { MMLPlayer, PlayerState } from './mml/player';
import { SAMPLE_LIST, SAMPLE_MML } from './samples';

function App() {
  const playerRef = useRef<MMLPlayer | null>(null);
  const [mml, setMml] = useState(SAMPLE_MML.twinkleStar);
  const [playerState, setPlayerState] = useState<PlayerState>('stopped');
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tempo, setTempo] = useState(120);
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [channelStates, setChannelStates] = useState([
    { id: 1, name: 'CH1', enabled: true },
    { id: 2, name: 'CH2', enabled: true },
    { id: 3, name: 'CH3', enabled: true },
    { id: 4, name: 'CH4', enabled: true },
  ]);
  const [isLooping, setIsLooping] = useState(false);

  useEffect(() => {
    const player = new MMLPlayer();
    playerRef.current = player;

    player.setCallback((state, pos, dur) => {
      setPlayerState(state);
      setPosition(pos);
      setDuration(dur);
      setTempo(player.currentTempo);
    });

    // 初期MMLをロード
    player.load(mml);

    return () => {
      player.stop();
    };
  }, []);

  const handlePlay = async () => {
    if (playerRef.current) {
      if (playerState === 'stopped') {
        playerRef.current.load(mml);
      }
      await playerRef.current.play();
    }
  };

  const handlePause = () => {
    playerRef.current?.pause();
  };

  const handleStop = () => {
    playerRef.current?.stop();
  };

  const handleSeek = (newPosition: number) => {
    playerRef.current?.seek(newPosition);
  };

  const handleMMLChange = (newMml: string) => {
    setMml(newMml);
    // 停止中のみ自動リロード
    if (playerState === 'stopped' && playerRef.current) {
      playerRef.current.load(newMml);
    }
  };

  const handleSampleSelect = (sampleMml: string) => {
    setMml(sampleMml);
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.load(sampleMml);
    }
  };

  const handleMasterVolumeChange = (volume: number) => {
    setMasterVolume(volume);
    playerRef.current?.setMasterVolume(volume);
  };

  const handleToggleChannel = (channelId: number) => {
    setChannelStates(prev =>
      prev.map(ch =>
        ch.id === channelId ? { ...ch, enabled: !ch.enabled } : ch
      )
    );
    if (playerRef.current) {
      const ch = channelStates.find(c => c.id === channelId);
      playerRef.current.enableChannel(channelId, !ch?.enabled);
    }
  };

  const handleToggleLoop = () => {
    const newLooping = !isLooping;
    setIsLooping(newLooping);
    playerRef.current?.setLooping(newLooping);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">
          <span style={styles.titleIcon}>&#x1F3AE;</span>
          Game Boy MML Player
        </h1>
        <p className="app-subtitle">
          ゲームボーイ音源エミュレータ & MML再生
        </p>
      </header>

      <main className="app-main">
        <div className="app-left-panel">
          <div className="app-editor-container">
            <MMLEditor
              value={mml}
              onChange={handleMMLChange}
              disabled={playerState === 'playing'}
            />
          </div>
        </div>

        <div className="app-right-panel">
          <PlayerControls
            state={playerState}
            position={position}
            duration={duration}
            tempo={tempo}
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            onSeek={handleSeek}
          />

          <div className="loop-control" style={styles.loopControl}>
            <label style={styles.loopLabel}>
              <input
                type="checkbox"
                checked={isLooping}
                onChange={handleToggleLoop}
                style={styles.checkbox}
              />
              Loop Playback
            </label>
          </div>

          <ChannelMixer
            channels={channelStates}
            masterVolume={masterVolume}
            onToggleChannel={handleToggleChannel}
            onMasterVolumeChange={handleMasterVolumeChange}
          />

          <SampleSelector
            samples={SAMPLE_LIST}
            onSelect={handleSampleSelect}
          />

          <div className="help-section" style={styles.help}>
            <h3 style={styles.helpTitle}>MML Reference</h3>
            <div className="help-content" style={styles.helpContent}>
              <p><b>A/B/C/D:</b> Channel (CH1-4)</p>
              <p><b>C D E F G A B:</b> Notes</p>
              <p><b>+ #:</b> Sharp | <b>-:</b> Flat</p>
              <p><b>R:</b> Rest</p>
              <p><b>O&lt;n&gt;:</b> Octave (1-8)</p>
              <p><b>&gt; &lt;:</b> Octave up/down</p>
              <p><b>L&lt;n&gt;:</b> Default length</p>
              <p><b>T&lt;n&gt;:</b> Tempo (BPM)</p>
              <p><b>V&lt;n&gt;:</b> Volume (0-15)</p>
              <p><b>@&lt;n&gt;:</b> Duty (0-3)</p>
              <p><b>W&lt;n&gt;:</b> Wave preset</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>Web Audio API + React | Game Boy APU Emulation</p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  titleIcon: {
    marginRight: '8px',
  },
  loopControl: {
    backgroundColor: '#1e2a3a',
    borderRadius: '4px',
    border: '2px solid #9be36d',
  },
  loopLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#9be36d',
    cursor: 'pointer',
    fontSize: '14px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  help: {
    backgroundColor: '#1e2a3a',
    borderRadius: '4px',
    border: '2px solid #9be36d',
  },
  helpTitle: {
    color: '#9be36d',
    fontSize: '14px',
    margin: '0 0 12px 0',
    textTransform: 'uppercase',
  },
  helpContent: {
    color: '#6b8f5c',
    lineHeight: '1.6',
    fontFamily: "'Courier New', monospace",
  },
};

export default App;
