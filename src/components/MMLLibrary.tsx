import { useState, useEffect } from 'react';
import { getSavedMMLs, saveMML, deleteMML, SavedMML } from '../storage';

interface Preset {
  name: string;
  mml: string;
}

interface MMLLibraryProps {
  presets: Preset[];
  currentMML: string;
  onSelect: (mml: string) => void;
}

export function MMLLibrary({ presets, currentMML, onSelect }: MMLLibraryProps) {
  const [savedMMLs, setSavedMMLs] = useState<SavedMML[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setSavedMMLs(getSavedMMLs());
  }, []);

  const handleSave = () => {
    if (!saveName.trim()) return;
    const newMML = saveMML(saveName.trim(), currentMML);
    setSavedMMLs(prev => [...prev, newMML]);
    setSaveName('');
    setShowSaveDialog(false);
  };

  const handleDelete = (id: string) => {
    if (deleteMML(id)) {
      setSavedMMLs(prev => prev.filter(item => item.id !== id));
    }
    setDeleteConfirmId(null);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span>MML Library</span>
        <button
          style={styles.saveButton}
          onClick={() => setShowSaveDialog(true)}
          title="Save current MML"
        >
          + Save
        </button>
      </div>

      {showSaveDialog && (
        <div style={styles.saveDialog}>
          <input
            type="text"
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            placeholder="Enter name..."
            style={styles.saveInput}
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') setShowSaveDialog(false);
            }}
          />
          <div style={styles.saveActions}>
            <button style={styles.actionButton} onClick={handleSave}>
              Save
            </button>
            <button
              style={{ ...styles.actionButton, ...styles.cancelButton }}
              onClick={() => {
                setShowSaveDialog(false);
                setSaveName('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {savedMMLs.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Saved</div>
          <div className="mml-library-list" style={styles.list}>
            {savedMMLs.map(item => (
              <div key={item.id} style={styles.itemRow}>
                {deleteConfirmId === item.id ? (
                  <div style={styles.confirmDelete}>
                    <span style={styles.confirmText}>Delete?</span>
                    <button
                      style={{ ...styles.smallButton, ...styles.deleteConfirm }}
                      onClick={() => handleDelete(item.id)}
                    >
                      Yes
                    </button>
                    <button
                      style={styles.smallButton}
                      onClick={() => setDeleteConfirmId(null)}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      className="mml-library-button"
                      style={styles.button}
                      onClick={() => onSelect(item.mml)}
                      title={formatDate(item.updatedAt)}
                    >
                      {item.name}
                    </button>
                    <button
                      style={styles.deleteButton}
                      onClick={() => setDeleteConfirmId(item.id)}
                      title="Delete"
                    >
                      x
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Presets</div>
        <div className="mml-library-list" style={styles.list}>
          {presets.map((preset, index) => (
            <button
              key={index}
              className="mml-library-button"
              style={styles.presetButton}
              onClick={() => onSelect(preset.mml)}
            >
              {preset.name}
            </button>
          ))}
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#9be36d',
    marginBottom: '12px',
    textTransform: 'uppercase',
  },
  saveButton: {
    padding: '4px 12px',
    backgroundColor: '#9be36d',
    color: '#0d1117',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Courier New', monospace",
    fontSize: '12px',
    fontWeight: 'bold',
  },
  saveDialog: {
    marginBottom: '12px',
    padding: '12px',
    backgroundColor: '#2d3a4f',
    borderRadius: '4px',
    border: '1px solid #9be36d',
  },
  saveInput: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#0d1117',
    color: '#9be36d',
    border: '1px solid #9be36d',
    borderRadius: '4px',
    fontFamily: "'Courier New', monospace",
    fontSize: '13px',
    marginBottom: '8px',
    boxSizing: 'border-box',
  },
  saveActions: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    flex: 1,
    padding: '6px 12px',
    backgroundColor: '#9be36d',
    color: '#0d1117',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Courier New', monospace",
    fontSize: '12px',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#4a5568',
    color: '#9be36d',
  },
  section: {
    marginBottom: '12px',
  },
  sectionTitle: {
    fontSize: '11px',
    color: '#6b8f5c',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  list: {
    display: 'grid',
    gap: '6px',
  },
  itemRow: {
    display: 'flex',
    gap: '4px',
  },
  button: {
    flex: 1,
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
  presetButton: {
    padding: '10px 16px',
    backgroundColor: '#1a2535',
    color: '#6b8f5c',
    border: '1px solid #4a5568',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Courier New', monospace",
    fontSize: '13px',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  deleteButton: {
    padding: '0 10px',
    backgroundColor: 'transparent',
    color: '#6b8f5c',
    border: '1px solid #4a5568',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Courier New', monospace",
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  confirmDelete: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    padding: '6px 12px',
    backgroundColor: '#3d2a2a',
    borderRadius: '4px',
    border: '1px solid #e36d6d',
  },
  confirmText: {
    flex: 1,
    color: '#e36d6d',
    fontSize: '13px',
  },
  smallButton: {
    padding: '4px 10px',
    backgroundColor: '#4a5568',
    color: '#9be36d',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Courier New', monospace",
    fontSize: '11px',
  },
  deleteConfirm: {
    backgroundColor: '#e36d6d',
    color: '#0d1117',
  },
};
