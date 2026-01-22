import { useState } from 'react';

interface MMLEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MMLEditor({ value, onChange, disabled }: MMLEditorProps) {
  const [lineCount, setLineCount] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    onChange(text);
    setLineCount(text.split('\n').length);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>MML Editor</span>
        <span style={styles.lineInfo}>Lines: {lineCount}</span>
      </div>
      <div style={styles.editorWrapper}>
        <textarea
          className="mml-editor-textarea"
          style={{
            ...styles.editor,
            ...(disabled ? styles.editorDisabled : {}),
          }}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder={`; Game Boy MML
; チャンネル: A(CH1), B(CH2), C(CH3), D(CH4)

A: T120 @2 V12 O4 L4
   CDEFGAB>C

B: T120 @1 V10 O3 L4
   EGEG EGEG`}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    border: '2px solid #9be36d',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#2d3a4f',
    borderBottom: '2px solid #9be36d',
  },
  title: {
    fontWeight: 'bold',
    color: '#9be36d',
  },
  lineInfo: {
    color: '#6b8f5c',
    fontSize: '12px',
  },
  editorWrapper: {
    flex: 1,
    position: 'relative',
  },
  editor: {
    width: '100%',
    height: '100%',
    padding: '12px',
    backgroundColor: '#0d1117',
    color: '#9be36d',
    border: 'none',
    outline: 'none',
    fontFamily: "'Courier New', monospace",
    lineHeight: '1.5',
    resize: 'none',
  },
  editorDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
};
