import React from 'react';
import * as LucideIcons from 'lucide-react';
import { ArrowUpRight, GripVertical } from 'lucide-react';
import styles from './Portal.module.css';

const PortalButton = ({
    portal,
    isDragging,
    isOver,
    onDragStart,
    onDragEnter,
    onDragEnd,
    draggable,
}) => {
    const { name, description, url, icon, custom_icon_url } = portal;

    const getIconComponent = (iconName) => {
        if (!iconName) return LucideIcons.Globe;
        return LucideIcons[iconName] || LucideIcons.Globe;
    };

    const IconComponent = getIconComponent(icon);

    const handleClick = (e) => {
        // Não abrir URL se o usuário estava arrastando
        if (isDragging) return;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const cardClass = [
        styles.portalButton,
        isDragging ? styles.portalButtonDragging : '',
        isOver     ? styles.portalButtonOver     : '',
    ].filter(Boolean).join(' ');

    return (
        <div
            className={cardClass}
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnter={onDragEnter}
            onDragEnd={onDragEnd}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleClick(e)}
        >
            {/* Handle de drag — visível no hover */}
            {draggable && (
                <div className={styles.dragHandle} title="Arraste para reorganizar">
                    <GripVertical size={14} />
                </div>
            )}

            {custom_icon_url ? (
                <img
                    src={custom_icon_url}
                    alt={name}
                    className={styles.portalButtonImage}
                    draggable={false}
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
        </div>
    );
};

export default PortalButton;
