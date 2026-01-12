import React, { useState, useEffect, useMemo } from 'react';
import { LogOut, LayoutGrid, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getPortals } from '../../services/portalService';
import PortalButton from './PortalButton';
import SettingsButton from '../settings/SettingsButton';
import PortalSettingsModal from '../settings/PortalSettingsModal';
// Logo from public folder
const defyLogo = '/defy-logo-bh-removebg-preview.png';
import styles from './Portal.module.css';

const PortalHome = () => {
    const { user, signOut } = useAuth();
    const [portals, setPortals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const loadPortals = async () => {
        try {
            setLoading(true);
            const data = await getPortals();
            setPortals(data);
        } catch (error) {
            console.error('Error loading portals:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPortals();
    }, []);

    const handleSettingsClose = () => {
        setSettingsOpen(false);
        loadPortals(); // Reload portals after settings change
    };

    const getUserDisplayName = () => {
        if (!user) return '';
        return user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'Usuário';
    };

    // Filter portals by search term
    const filteredPortals = useMemo(() => {
        if (!searchTerm.trim()) return portals;
        const term = searchTerm.toLowerCase();
        return portals.filter(portal =>
            portal.name.toLowerCase().includes(term) ||
            portal.description?.toLowerCase().includes(term)
        );
    }, [portals, searchTerm]);

    // Separate portals by category
    const internalPortals = useMemo(() =>
        filteredPortals.filter(p => p.category === 'internal'),
        [filteredPortals]
    );

    const externalPortals = useMemo(() =>
        filteredPortals.filter(p => p.category === 'external'),
        [filteredPortals]
    );

    const hasPortals = portals.length > 0;
    const hasFilteredResults = filteredPortals.length > 0;

    return (
        <div className={styles.portalContainer}>
            <div className={styles.portalContent}>
                <header className={styles.portalHeader}>
                    <div className={styles.logoContainer}>
                        <img src={defyLogo} alt="Defy Solutions" />
                    </div>
                    <h1 className={styles.portalTitle}>Portal Corporativo</h1>
                    <p className={styles.portalSubtitle}>
                        Acesse todos os sistemas e ferramentas da Defy
                    </p>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{getUserDisplayName()}</span>
                        <button className={styles.logoutButton} onClick={signOut}>
                            <LogOut size={16} />
                            Sair
                        </button>
                    </div>
                </header>

                {/* Global Search Box */}
                {hasPortals && (
                    <div className={styles.searchContainer}>
                        <div className={styles.searchBox}>
                            <Search size={18} className={styles.searchIcon} />
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Pesquisar portais..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className={styles.emptyState}>
                        <p>Carregando portais...</p>
                    </div>
                ) : !hasPortals ? (
                    <div className={styles.emptyState}>
                        <LayoutGrid className={styles.emptyStateIcon} />
                        <h3 className={styles.emptyStateTitle}>Nenhum portal cadastrado</h3>
                        <p className={styles.emptyStateText}>
                            Clique no botão de configurações para adicionar portais.
                        </p>
                    </div>
                ) : !hasFilteredResults ? (
                    <div className={styles.emptyState}>
                        <Search className={styles.emptyStateIcon} />
                        <h3 className={styles.emptyStateTitle}>Nenhum resultado encontrado</h3>
                        <p className={styles.emptyStateText}>
                            Tente buscar por outro termo.
                        </p>
                    </div>
                ) : (
                    <div className={styles.portalSections}>
                        {/* Internal Portals Section */}
                        {internalPortals.length > 0 && (
                            <section className={styles.portalSection}>
                                <h2 className={styles.sectionTitle}>Soluções fechadas Defy</h2>
                                <div className={styles.portalGrid}>
                                    {internalPortals.map((portal) => (
                                        <PortalButton key={portal.id} portal={portal} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* External Portals Section */}
                        {externalPortals.length > 0 && (
                            <section className={styles.portalSection}>
                                <h2 className={styles.sectionTitle}>Soluções abertas ao público</h2>
                                <div className={styles.portalGrid}>
                                    {externalPortals.map((portal) => (
                                        <PortalButton key={portal.id} portal={portal} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}

                <SettingsButton onClick={() => setSettingsOpen(true)} />

                <PortalSettingsModal
                    isOpen={settingsOpen}
                    onClose={handleSettingsClose}
                />
            </div>
        </div>
    );
};

export default PortalHome;
