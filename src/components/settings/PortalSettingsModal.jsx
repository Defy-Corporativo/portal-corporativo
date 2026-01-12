import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Pencil, Trash2, Save, Search, ChevronUp, AlertTriangle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getAllPortals, createPortal, updatePortal, deletePortal } from '../../services/portalService';
import styles from './Settings.module.css';

// Available icons for selection
const AVAILABLE_ICONS = [
    'LayoutGrid', 'BarChart3', 'LineChart', 'PieChart', 'TrendingUp',
    'Users', 'UserCircle', 'Building2', 'Briefcase', 'FileText',
    'FolderOpen', 'Database', 'Server', 'Cloud', 'Globe',
    'Mail', 'MessageSquare', 'Bell', 'Calendar', 'Clock',
    'Shield', 'Lock', 'Key', 'Settings', 'Wrench',
    'Wallet', 'CreditCard', 'DollarSign', 'Receipt', 'Calculator',
    'Package', 'Truck', 'ShoppingCart', 'Store', 'Tag',
    'Heart', 'Star', 'Award', 'Target', 'Zap',
    'Lightbulb', 'Rocket', 'Compass', 'Map', 'Navigation',
];

const MAX_DESCRIPTION_LENGTH = 150;

const PortalSettingsModal = ({ isOpen, onClose }) => {
    const [portals, setPortals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingPortal, setEditingPortal] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, portal: null });
    const formRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        description: '',
        icon: 'Globe',
        category: 'internal',
    });

    useEffect(() => {
        if (isOpen) {
            loadPortals();
            setShowForm(false);
            setSearchTerm('');
        }
    }, [isOpen]);

    const loadPortals = async () => {
        try {
            setLoading(true);
            const data = await getAllPortals();
            setPortals(data);
        } catch (error) {
            console.error('Error loading portals:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            url: '',
            description: '',
            icon: 'Globe',
            category: 'internal',
        });
        setEditingPortal(null);
    };

    const hideForm = () => {
        resetForm();
        setShowForm(false);
    };

    // Filter portals based on search term
    const filteredPortals = portals.filter(portal => {
        const term = searchTerm.toLowerCase();
        return (
            portal.name.toLowerCase().includes(term) ||
            portal.url.toLowerCase().includes(term) ||
            portal.description?.toLowerCase().includes(term)
        );
    });

    const handleEdit = (portal) => {
        setEditingPortal(portal);
        setFormData({
            name: portal.name,
            url: portal.url,
            description: portal.description,
            icon: portal.icon || 'Globe',
            category: portal.category || 'internal',
        });
        setShowForm(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleDeleteClick = (portal) => {
        setDeleteConfirm({ show: true, portal });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm.portal) return;

        try {
            await deletePortal(deleteConfirm.portal.id);
            await loadPortals();
        } catch (error) {
            console.error('Error deleting portal:', error);
            alert('Erro ao excluir portal.');
        } finally {
            setDeleteConfirm({ show: false, portal: null });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirm({ show: false, portal: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.url.trim() || !formData.description.trim()) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }

        try {
            if (editingPortal) {
                await updatePortal(editingPortal.id, formData);
            } else {
                await createPortal(formData);
            }
            await loadPortals();
            // Keep form visible for adding more portals, just reset fields
            resetForm();
        } catch (error) {
            console.error('Error saving portal:', error);
            alert('Erro ao salvar portal.');
        }
    };

    const handleInputChange = (field, value) => {
        if (field === 'description' && value.length > MAX_DESCRIPTION_LENGTH) {
            return;
        }
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getIconComponent = (iconName) => {
        return LucideIcons[iconName] || LucideIcons.Globe;
    };

    const getDescriptionCharClass = () => {
        const length = formData.description.length;
        if (length >= MAX_DESCRIPTION_LENGTH) return styles.error;
        if (length >= MAX_DESCRIPTION_LENGTH - 20) return styles.warning;
        return '';
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Gerenciar Portais</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {/* Add New Portal Button - shown when form is hidden */}
                    {!showForm && (
                        <button
                            className={styles.addNewPortalButton}
                            onClick={() => setShowForm(true)}
                        >
                            <Plus size={20} />
                            Adicionar Novo Portal
                        </button>
                    )}

                    {/* Add/Edit Form - at top for easier access */}
                    {showForm && (
                        <div ref={formRef} className={styles.formSection}>
                            <div className={styles.formHeader}>
                                <h3 className={styles.formTitle}>
                                    {editingPortal ? 'Editar Portal' : 'Adicionar Novo Portal'}
                                </h3>
                                {!editingPortal && portals.length > 0 && (
                                    <button
                                        type="button"
                                        className={styles.minimizeButton}
                                        onClick={hideForm}
                                        title="Minimizar formulário"
                                    >
                                        <ChevronUp size={20} />
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Nome do Portal *</label>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            placeholder="Ex: Forecast Comercial"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            maxLength={100}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>URL do Portal *</label>
                                        <input
                                            type="url"
                                            className={styles.formInput}
                                            placeholder="https://exemplo.defysolutions.com.br"
                                            value={formData.url}
                                            onChange={(e) => handleInputChange('url', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Descrição *</label>
                                    <input
                                        type="text"
                                        className={styles.formInput}
                                        placeholder="Breve descrição do portal"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        maxLength={MAX_DESCRIPTION_LENGTH}
                                        required
                                    />
                                    <div className={`${styles.charCount} ${getDescriptionCharClass()}`}>
                                        {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Categoria *</label>
                                    <div className={styles.categorySelector}>
                                        <button
                                            type="button"
                                            className={`${styles.categoryOption} ${formData.category === 'internal' ? styles.selected : ''}`}
                                            onClick={() => handleInputChange('category', 'internal')}
                                        >
                                            Soluções Internas
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.categoryOption} ${formData.category === 'external' ? styles.selected : ''}`}
                                            onClick={() => handleInputChange('category', 'external')}
                                        >
                                            Soluções Externas
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Ícone</label>
                                    <div className={styles.iconSelector}>
                                        {AVAILABLE_ICONS.map((iconName) => {
                                            const IconComponent = LucideIcons[iconName];
                                            if (!IconComponent) return null;
                                            return (
                                                <button
                                                    key={iconName}
                                                    type="button"
                                                    className={`${styles.iconOption} ${formData.icon === iconName ? styles.selected : ''}`}
                                                    onClick={() => handleInputChange('icon', iconName)}
                                                    title={iconName}
                                                >
                                                    <IconComponent size={20} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className={styles.formHint}>
                                        Ícone selecionado: {formData.icon}
                                    </p>
                                </div>

                                <div className={styles.formActions}>
                                    {editingPortal && (
                                        <button
                                            type="button"
                                            className={styles.cancelButton}
                                            onClick={resetForm}
                                        >
                                            Cancelar Edição
                                        </button>
                                    )}
                                    <button type="submit" className={styles.submitButton}>
                                        {editingPortal ? (
                                            <>
                                                <Save size={18} />
                                                Salvar Alterações
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={18} />
                                                Adicionar Portal
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Portal List Section */}
                    {portals.length > 0 && (
                        <div className={styles.portalListSection}>
                            <div className={styles.portalListHeader}>
                                <h3 className={styles.portalListTitle}>
                                    Portais Cadastrados ({portals.length})
                                </h3>
                                {portals.length > 3 && (
                                    <div className={styles.searchContainer}>
                                        <Search size={16} className={styles.searchIcon} />
                                        <input
                                            type="text"
                                            className={styles.searchInput}
                                            placeholder="Pesquisar portais..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Portal List with scroll */}
                            <div className={styles.portalListScrollable}>
                                {filteredPortals.length === 0 ? (
                                    <div className={styles.emptySearchResult}>
                                        Nenhum portal encontrado.
                                    </div>
                                ) : (
                                    filteredPortals.map((portal) => {
                                        const IconComponent = getIconComponent(portal.icon);
                                        return (
                                            <div key={portal.id} className={styles.portalListItem}>
                                                <div className={styles.portalListItemInfo}>
                                                    <IconComponent className={styles.portalListItemIcon} />
                                                    <div className={styles.portalListItemDetails}>
                                                        <p className={styles.portalListItemName}>{portal.name}</p>
                                                        <p className={styles.portalListItemUrl}>{portal.url}</p>
                                                    </div>
                                                </div>
                                                <div className={styles.portalListItemActions}>
                                                    <button
                                                        className={`${styles.iconButton} ${styles.edit}`}
                                                        onClick={() => handleEdit(portal)}
                                                        title="Editar"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        className={`${styles.iconButton} ${styles.delete}`}
                                                        onClick={() => handleDeleteClick(portal)}
                                                        title="Excluir"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* Empty state when no portals */}
                    {!loading && portals.length === 0 && !showForm && (
                        <div className={styles.emptyList}>
                            Nenhum portal cadastrado. Clique no botão acima para adicionar.
                        </div>
                    )}

                    {loading && (
                        <div className={styles.emptyList}>Carregando...</div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirm.show && (
                    <div className={styles.confirmOverlay} onClick={handleDeleteCancel}>
                        <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.confirmIcon}>
                                <AlertTriangle size={48} />
                            </div>
                            <h3 className={styles.confirmTitle}>Excluir Portal</h3>
                            <p className={styles.confirmMessage}>
                                Tem certeza que deseja excluir <strong>{deleteConfirm.portal?.name}</strong>?
                            </p>
                            <div className={styles.confirmActions}>
                                <button
                                    className={styles.confirmCancelButton}
                                    onClick={handleDeleteCancel}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className={styles.confirmDeleteButton}
                                    onClick={handleDeleteConfirm}
                                >
                                    <Trash2 size={16} />
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortalSettingsModal;
