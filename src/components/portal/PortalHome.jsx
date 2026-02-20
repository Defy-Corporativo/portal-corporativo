import React, { useState, useEffect, useMemo } from 'react';
import { LogOut, Search, LayoutGrid } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getPortals } from '../../services/portalService';
import PortalButton from './PortalButton';
import SettingsButton from '../settings/SettingsButton';
import PortalSettingsModal from '../settings/PortalSettingsModal';
import styles from './Portal.module.css';

const defyLogo = '/logo-defy.png';

const SKELETON_COUNT = 6;

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
        loadPortals();
    };

    const getUserDisplayName = () => {
        if (!user) return '';
        return user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'Usuário';
    };

    const filteredPortals = useMemo(() => {
        if (!searchTerm.trim()) return portals;
        const term = searchTerm.toLowerCase();
        return portals.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.description?.toLowerCase().includes(term)
        );
    }, [portals, searchTerm]);

    const internalPortals = useMemo(() =>
        filteredPortals.filter(p => p.category === 'internal'), [filteredPortals]);

    const externalPortals = useMemo(() =>
        filteredPortals.filter(p => p.category === 'external'), [filteredPortals]);

    const hasPortals = portals.length > 0;
    const hasFilteredResults = filteredPortals.length > 0;

    return (
        <div className={styles.portalContainer}>
            {/* ── Topbar ── */}
            <header className={styles.topbar}>
                <div className={styles.topbarLogo}>
                    <img src={defyLogo} alt="Defy Solutions" />
                </div>
                <div className={styles.topbarRight}>
                    <span className={styles.userName}>{getUserDisplayName()}</span>
                    <button className={styles.logoutButton} onClick={signOut}>
                        <LogOut size={14} />
                        Sair
                    </button>
                </div>
            </header>

            {/* ── Conteúdo ── */}
            <main className={styles.portalContent}>
                {/* Hero */}
                <div className={styles.portalHero}>
                    <h1 className={styles.portalTitle}>
                        Bem-vindo ao{' '}
                        <span className={styles.portalTitleAccent}>Portal Corporativo</span>
                    </h1>
                    <p className={styles.portalSubtitle}>
                        Acesse todos os sistemas e soluções da Defy em um só lugar
                    </p>
                </div>

                {/* Busca */}
                {hasPortals && (
                    <div className={styles.searchContainer}>
                        <div className={styles.searchBox}>
                            <Search size={18} className={styles.searchIcon} />
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Buscar portais e soluções..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Estados */}
                {loading ? (
                    <div className={styles.skeletonGrid}>
                        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                            <div key={i} className={styles.skeletonCard} />
                        ))}
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
                        <p className={styles.emptyStateText}>Tente buscar por outro termo.</p>
                    </div>
                ) : (
                    <div className={styles.portalSections}>
                        {internalPortals.length > 0 && (
                            <section className={styles.portalSection}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>Soluções Defy</h2>
                                    <div className={styles.sectionLine} />
                                    <span className={styles.sectionBadge}>
                                        {internalPortals.length} {internalPortals.length === 1 ? 'sistema' : 'sistemas'}
                                    </span>
                                </div>
                                <div className={styles.portalGrid}>
                                    {internalPortals.map(portal => (
                                        <PortalButton key={portal.id} portal={portal} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {externalPortals.length > 0 && (
                            <section className={styles.portalSection}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>Soluções Públicas</h2>
                                    <div className={styles.sectionLine} />
                                    <span className={styles.sectionBadge}>
                                        {externalPortals.length} {externalPortals.length === 1 ? 'sistema' : 'sistemas'}
                                    </span>
                                </div>
                                <div className={styles.portalGrid}>
                                    {externalPortals.map(portal => (
                                        <PortalButton key={portal.id} portal={portal} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>

            <SettingsButton onClick={() => setSettingsOpen(true)} />

            <PortalSettingsModal
                isOpen={settingsOpen}
                onClose={handleSettingsClose}
            />
        </div>
    );
};

export default PortalHome;
