import React from 'react';
import styles from './Controls.module.css';

const Controls = ({
    itemCount,
    setItemCount,
    removeOnWin,
    setRemoveOnWin,
    isCustomMode,
    setIsCustomMode,
    customItemsText,
    setCustomItemsText,
    onSpin,
    disabled
}) => {

    const handleCountChange = (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val)) val = 2;
        if (val < 2) val = 2;
        if (val > 50) val = 50;
        setItemCount(val);
    };

    return (
        <div className={styles.controls}>
            <div className={styles.row}>
                <label className={styles.label}>
                    Mode:
                    <button
                        className={isCustomMode ? styles.modeBtnActive : styles.modeBtn}
                        onClick={() => setIsCustomMode(!isCustomMode)}
                    >
                        {isCustomMode ? 'Custom Text' : 'Numbers'}
                    </button>
                </label>
            </div>

            {!isCustomMode && (
                <div className={styles.row}>
                    <label className={styles.label}>
                        Number of Items: <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{itemCount}</span>
                    </label>
                    <input
                        type="range"
                        min="2"
                        max="50"
                        value={itemCount}
                        onChange={handleCountChange}
                        className={styles.slider}
                    />
                </div>
            )}

            {isCustomMode && (
                <div className={styles.column}>
                    <label className={styles.label}>
                        Custom Items (One per line):
                    </label>
                    <textarea
                        className={styles.textarea}
                        value={customItemsText}
                        onChange={(e) => setCustomItemsText(e.target.value)}
                        placeholder="Enter items here..."
                        rows={5}
                    />
                </div>
            )}

            <div className={styles.row}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={removeOnWin}
                        onChange={(e) => setRemoveOnWin(e.target.checked)}
                    />
                    Remove winner from list
                </label>
            </div>

            <button
                className={styles.spinButton}
                onClick={onSpin}
                disabled={disabled}
            >
                SPIN
            </button>
        </div>
    );
};

export default Controls;
