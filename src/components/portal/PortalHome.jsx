import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { LogOut, Search, LayoutGrid, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getPortals, savePortalOrder, loadPortalOrder } from '../../services/portalService';
import PortalButton from './PortalButton';
import SettingsButton from '../settings/SettingsButton';
import PortalSettingsModal from '../settings/PortalSettingsModal';
import CompanyInfoModal from './CompanyInfoModal';
import styles from './Portal.module.css';

const defyLogo = '/logo-defy.png';


const SKELETON_COUNT = 6;

const PortalHome = () => {
    const { user, signOut } = useAuth();
    const [portals, setPortals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [companyOpen, setCompanyOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const loadPortals = async () => {
        try {
            setLoading(true);

            // Busca portais e arquivo de ordem em paralelo
            const [data, savedOrder] = await Promise.all([
                getPortals(),
                loadPortalOrder(),
            ]);

            if (savedOrder?.order?.length > 0) {
                // Aplica a ordem salva no arquivo JSON
                const indexMap = new Map(savedOrder.order.map((id, i) => [id, i]));
                const sorted = [...data].sort((a, b) => {
                    const ai = indexMap.has(a.id) ? indexMap.get(a.id) : Number.MAX_SAFE_INTEGER;
                    const bi = indexMap.has(b.id) ? indexMap.get(b.id) : Number.MAX_SAFE_INTEGER;
                    return ai - bi;
                });
                setPortals(sorted);
            } else {
                // Nenhum arquivo ainda: usa a ordem padrão do banco
                setPortals(data);
            }
        } catch (error) {
            console.error('Error loading portals:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadPortals(); }, []);

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

    /* ── Reordenação via drag & drop ── */
    const handleReorder = useCallback(async (newPortals) => {
        // Atualiza a UI de forma otimista (imediata)
        setPortals(newPortals);
        try {
            // Salva todos os IDs na nova ordem em um arquivo JSON no Storage
            // Sem alterar nenhuma coluna do banco de dados
            const allIds = newPortals.map(p => p.id);
            await savePortalOrder(allIds);
        } catch (err) {
            console.error('Erro ao salvar ordem:', err);
        }
    }, []);

    /* ── Filtragem ── */
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
                <button
                    className={styles.topbarCompany}
                    onClick={() => setCompanyOpen(true)}
                    title="Ver dados da empresa"
                >
                    <span className={styles.topbarCompanyName}>
                        <span className={styles.topbarDefy}>DEFY</span>
                        <span className={styles.topbarSuffix}>WORLD TECH SOLUTIONS LTDA</span>
                    </span>
                    <Info size={13} className={styles.topbarInfoIcon} />
                </button>

                <div className={styles.topbarRight}>
                    <span className={styles.userName}>{getUserDisplayName()}</span>
                    <button className={styles.logoutButton} onClick={signOut}>
                        <LogOut size={14} />
                        Sair
                    </button>
                </div>
            </header>

            <main className={styles.portalContent}>
                {/* ── Marca em destaque ── */}
                <div className={styles.brandHero}>
                    <img src={defyLogo} alt="Defy — Easy by IA" className={styles.brandHeroLogo} />
                </div>

                {/* ── Hero título ── */}
                <div className={styles.portalHero}>
                    <h1 className={styles.portalTitle}>
                        <span className={styles.portalTitleAccent}>Portal Corporativo</span>
                    </h1>
                    <p className={styles.portalSubtitle}>
                        Acesse todos os sistemas e soluções em um só lugar
                    </p>
                </div>

                {/* ── Busca ── */}
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

                {/* ── Conteúdo ── */}
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
                            <PortalSection
                                title="Soluções Defy"
                                portals={internalPortals}
                                allPortals={portals}
                                onReorder={handleReorder}
                                isSearching={!!searchTerm.trim()}
                            />
                        )}
                        {externalPortals.length > 0 && (
                            <PortalSection
                                title="Soluções Públicas"
                                portals={externalPortals}
                                allPortals={portals}
                                onReorder={handleReorder}
                                isSearching={!!searchTerm.trim()}
                            />
                        )}
                    </div>
                )}
            </main>

            <SettingsButton onClick={() => setSettingsOpen(true)} />
            <PortalSettingsModal isOpen={settingsOpen} onClose={handleSettingsClose} />
            <CompanyInfoModal isOpen={companyOpen} onClose={() => setCompanyOpen(false)} />
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   PortalSection — seção com drag-and-drop interno
   ───────────────────────────────────────────────────────────── */
const PortalSection = ({ title, portals, allPortals, onReorder, isSearching }) => {
    const dragItem  = useRef(null);
    const dragOver  = useRef(null);
    const [dragId, setDragId]   = useState(null);
    const [overId, setOverId]   = useState(null);

    const handleDragStart = (e, id) => {
        dragItem.current = id;
        setDragId(id);
        e.dataTransfer.effectAllowed = 'move';
        // Atraso para o "ghost" não mostrar o estado transparente imediatamente
        setTimeout(() => {
            setDragId(id);
        }, 0);
    };

    const handleDragEnter = (e, id) => {
        e.preventDefault();
        dragOver.current = id;
        setOverId(id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (dragItem.current === null || dragOver.current === null) return;
        if (dragItem.current === dragOver.current) return;

        // Reordenar dentro desta seção
        const sectionIds = portals.map(p => p.id);
        const fromIdx = sectionIds.indexOf(dragItem.current);
        const toIdx   = sectionIds.indexOf(dragOver.current);
        if (fromIdx === -1 || toIdx === -1) return;

        const reordered = [...portals];
        const [moved] = reordered.splice(fromIdx, 1);
        reordered.splice(toIdx, 0, moved);

        // Reconstruir o array completo mantendo a outra seção
        const otherPortals = allPortals.filter(p => p.category !== portals[0]?.category);
        const newAll = portals[0]?.category === 'internal'
            ? [...reordered, ...otherPortals]
            : [...otherPortals, ...reordered];

        onReorder(newAll);
        dragItem.current = null;
        dragOver.current = null;
    };

    const handleDragEnd = () => {
        setDragId(null);
        setOverId(null);
        dragItem.current = null;
        dragOver.current = null;
    };

    return (
        <section className={styles.portalSection}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{title}</h2>
                <div className={styles.sectionLine} />
                {!isSearching && (
                    <span className={styles.sectionBadge}>
                        {portals.length} {portals.length === 1 ? 'sistema' : 'sistemas'}
                    </span>
                )}
            </div>
            <div
                className={styles.portalGrid}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {portals.map(portal => (
                    <PortalButton
                        key={portal.id}
                        portal={portal}
                        isDragging={dragId === portal.id}
                        isOver={overId === portal.id && dragId !== portal.id}
                        onDragStart={e => handleDragStart(e, portal.id)}
                        onDragEnter={e => handleDragEnter(e, portal.id)}
                        onDragEnd={handleDragEnd}
                        draggable={!isSearching}
                    />
                ))}
            </div>
        </section>
    );
};

export default PortalHome;
