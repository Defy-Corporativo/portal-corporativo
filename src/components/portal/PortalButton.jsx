import React from 'react';
import * as LucideIcons from 'lucide-react';
import styles from './Portal.module.css';

const PortalButton = ({ portal }) => {
    const { name, description, url, icon } = portal;

    // Dynamically get the icon component from lucide-react
    // Icons are stored in PascalCase format (e.g., TrendingUp, BarChart3)
    const getIconComponent = (iconName) => {
        if (!iconName) return LucideIcons.Globe;
        return LucideIcons[iconName] || LucideIcons.Globe;
    };

    const IconComponent = getIconComponent(icon);

    const handleClick = () => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <button className={styles.portalButton} onClick={handleClick}>
            <IconComponent className={styles.portalButtonIcon} />
            <div className={styles.portalButtonContent}>
                <h3 className={styles.portalButtonName}>{name}</h3>
                <p className={styles.portalButtonDescription}>{description}</p>
            </div>
        </button>
    );
};

export default PortalButton;
