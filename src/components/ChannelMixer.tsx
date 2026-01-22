interface ChannelMixerProps {
  channels: {
    id: number;
    name: string;
    enabled: boolean;
  }[];
  masterVolume: number;
  onToggleChannel: (channel: number) => void;
  onMasterVolumeChange: (volume: number) => void;
}

export function ChannelMixer({
  channels,
  masterVolume,
  onToggleChannel,
  onMasterVolumeChange,
}: ChannelMixerProps) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>Channel Mixer</div>

      <div className="channel-mixer-volume" style={styles.masterVolume}>
        <label style={styles.label}>Master Volume</label>
        <div className="channel-mixer-volume-row" style={styles.sliderRow}>
          <input
            type="range"
            min="0"
            max="100"
            value={masterVolume * 100}
            onChange={(e) => onMasterVolumeChange(parseInt(e.target.value) / 100)}
            style={styles.slider}
          />
          <span style={styles.volumeValue}>{Math.round(masterVolume * 100)}%</span>
        </div>
      </div>

      <div className="channel-mixer-channels" style={styles.channels}>
        {channels.map((ch) => (
          <div key={ch.id} style={styles.channel}>
            <button
              className="channel-mixer-button"
              style={{
                ...styles.channelButton,
                backgroundColor: ch.enabled ? '#9be36d' : '#2d3a4f',
                color: ch.enabled ? '#1a1a2e' : '#6b8f5c',
              }}
              onClick={() => onToggleChannel(ch.id)}
            >
              {ch.name}
            </button>
            <div style={styles.channelInfo}>
              {ch.enabled ? 'ON' : 'OFF'}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <span style={styles.legendColor}>CH1/CH2</span>: Pulse Wave
        </div>
        <div style={styles.legendItem}>
          <span style={styles.legendColor}>CH3</span>: Wave Memory
        </div>
        <div style={styles.legendItem}>
          <span style={styles.legendColor}>CH4</span>: Noise
        </div>
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
  header: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#9be36d',
    marginBottom: '16px',
    textTransform: 'uppercase',
  },
  masterVolume: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#0d1117',
    borderRadius: '4px',
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  label: {
    color: '#9be36d',
    fontSize: '12px',
    whiteSpace: 'nowrap',
  },
  slider: {
    flex: 1,
    height: '4px',
    appearance: 'none',
    backgroundColor: '#2d3a4f',
    borderRadius: '2px',
    cursor: 'pointer',
  },
  volumeValue: {
    color: '#6b8f5c',
    fontSize: '12px',
    fontFamily: "'Courier New', monospace",
    minWidth: '40px',
    textAlign: 'right',
  },
  channels: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
    marginBottom: '16px',
  },
  channel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  channelButton: {
    width: '100%',
    padding: '12px 8px',
    fontSize: '14px',
    fontWeight: 'bold',
    border: '2px solid #9be36d',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Courier New', monospace",
    transition: 'all 0.2s',
  },
  channelInfo: {
    fontSize: '10px',
    color: '#6b8f5c',
    fontFamily: "'Courier New', monospace",
  },
  legend: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '8px',
    backgroundColor: '#0d1117',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#6b8f5c',
  },
  legendItem: {
    fontFamily: "'Courier New', monospace",
  },
  legendColor: {
    color: '#9be36d',
  },
};
