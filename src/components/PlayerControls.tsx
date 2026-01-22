import { PlayerState } from '../mml/player';

interface PlayerControlsProps {
  state: PlayerState;
  position: number;
  duration: number;
  tempo: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (position: number) => void;
}

export function PlayerControls({
  state,
  position,
  duration,
  tempo,
  onPlay,
  onPause,
  onStop,
  onSeek,
}: PlayerControlsProps) {
  const progress = duration > 0 ? (position / duration) * 100 : 0;

  const formatTime = (ticks: number) => {
    const ticksPerSecond = (tempo * 24) / 60;
    const seconds = Math.floor(ticks / ticksPerSecond);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newPosition = Math.floor(percent * duration);
    onSeek(newPosition);
  };

  return (
    <div style={styles.container}>
      <div style={styles.controls}>
        <button
          style={styles.button}
          onClick={state === 'playing' ? onPause : onPlay}
          title={state === 'playing' ? 'Pause' : 'Play'}
        >
          {state === 'playing' ? '⏸' : '▶'}
        </button>
        <button
          style={styles.button}
          onClick={onStop}
          title="Stop"
        >
          ⏹
        </button>
        <div style={styles.timeDisplay}>
          {formatTime(position)} / {formatTime(duration)}
        </div>
        <div style={styles.tempoDisplay}>
          BPM: {tempo}
        </div>
      </div>

      <div
        style={styles.progressContainer}
        onClick={handleProgressClick}
      >
        <div
          style={{
            ...styles.progressBar,
            width: `${progress}%`,
          }}
        />
        <div
          style={{
            ...styles.progressHandle,
            left: `${progress}%`,
          }}
        />
      </div>

      <div style={styles.stateIndicator}>
        <span
          style={{
            ...styles.stateDot,
            backgroundColor: state === 'playing' ? '#4caf50' :
                           state === 'paused' ? '#ff9800' : '#666',
          }}
        />
        <span style={styles.stateText}>
          {state === 'playing' ? 'PLAYING' :
           state === 'paused' ? 'PAUSED' : 'STOPPED'}
        </span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    backgroundColor: '#1e2a3a',
    borderRadius: '4px',
    border: '2px solid #9be36d',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  button: {
    width: '48px',
    height: '48px',
    fontSize: '20px',
    backgroundColor: '#2d3a4f',
    color: '#9be36d',
    border: '2px solid #9be36d',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  timeDisplay: {
    fontFamily: "'Courier New', monospace",
    fontSize: '16px',
    color: '#9be36d',
    marginLeft: 'auto',
  },
  tempoDisplay: {
    fontFamily: "'Courier New', monospace",
    fontSize: '14px',
    color: '#6b8f5c',
    marginLeft: '16px',
  },
  progressContainer: {
    height: '12px',
    backgroundColor: '#0d1117',
    borderRadius: '6px',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'visible',
    marginBottom: '12px',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#9be36d',
    borderRadius: '6px',
    transition: 'width 0.1s linear',
  },
  progressHandle: {
    position: 'absolute',
    top: '50%',
    width: '16px',
    height: '16px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 0 4px rgba(0,0,0,0.5)',
  },
  stateIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stateDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  stateText: {
    fontSize: '12px',
    color: '#6b8f5c',
    fontFamily: "'Courier New', monospace",
  },
};
