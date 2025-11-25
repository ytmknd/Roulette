import React from 'react';
import styles from './ResultModal.module.css';

const ResultModal = ({ result, onClose }) => {
    if (!result) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h2 className={styles.title}>Winner!</h2>
                <div className={styles.result}>{result}</div>
                <button className={styles.closeBtn} onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default ResultModal;
