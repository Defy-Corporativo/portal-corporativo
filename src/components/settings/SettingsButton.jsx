import React from 'react';
import { Settings } from 'lucide-react';
import styles from './Settings.module.css';

const SettingsButton = ({ onClick }) => {
    return (
        <button
            className={styles.settingsButton}
            onClick={onClick}
            title="Configurações"
            aria-label="Abrir configurações"
        >
            <Settings size={24} />
        </button>
    );
};

export default SettingsButton;
