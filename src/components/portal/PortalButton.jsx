import React from 'react';
import * as LucideIcons from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import styles from './Portal.module.css';

const PortalButton = ({ portal }) => {
    const { name, description, url, icon, custom_icon_url } = portal;

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
            {custom_icon_url ? (
                <img
                    src={custom_icon_url}
                    alt={name}
                    className={styles.portalButtonImage}
                />
            ) : (
                <div className={styles.portalButtonIconWrap}>
                    <IconComponent className={styles.portalButtonIcon} />
                </div>
            )}
            <div className={styles.portalButtonContent}>
                <h3 className={styles.portalButtonName}>{name}</h3>
                {description && (
                    <p className={styles.portalButtonDescription}>{description}</p>
                )}
            </div>
            <ArrowUpRight className={styles.portalButtonArrow} size={18} />
        </button>
    );
};

export default PortalButton;
