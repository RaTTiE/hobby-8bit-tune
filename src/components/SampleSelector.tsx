interface Sample {
  name: string;
  mml: string;
}

interface SampleSelectorProps {
  samples: Sample[];
  onSelect: (mml: string) => void;
}

export function SampleSelector({ samples, onSelect }: SampleSelectorProps) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>Sample MML</div>
      <div style={styles.list}>
        {samples.map((sample, index) => (
          <button
            key={index}
            style={styles.button}
            onClick={() => onSelect(sample.mml)}
          >
            {sample.name}
          </button>
        ))}
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
    marginBottom: '12px',
    textTransform: 'uppercase',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  button: {
    padding: '10px 16px',
    backgroundColor: '#2d3a4f',
    color: '#9be36d',
    border: '1px solid #9be36d',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Courier New', monospace",
    fontSize: '13px',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
};
