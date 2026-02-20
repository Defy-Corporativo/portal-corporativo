import React, { useEffect } from 'react';
import { X, Building2, MapPin, Briefcase, Hash, Calendar, BadgeCheck } from 'lucide-react';
import styles from './CompanyInfo.module.css';

const COMPANY = {
    cnpj: '57.885.947/0001-44',
    tipo: 'MATRIZ',
    nomeEmpresarial: 'DEFY WORLD TECH SOLUTIONS LTDA',
    nomeFantasia: 'DEFY',
    dataAbertura: '29/10/2024',
    naturezaJuridica: '206-2 — Sociedade Empresária Limitada',
    endereco: {
        logradouro: 'Av. Brig. Faria Lima',
        numero: '1572',
        complemento: 'Conj. Escritório 1022',
        bairro: 'Jardim Paulistano',
        municipio: 'São Paulo',
        uf: 'SP',
        cep: '01.451-917',
    },
    cnaePrincipal: {
        codigo: '62.04-0-00',
        descricao: 'Consultoria em tecnologia da informação',
    },
    cnaesSecundarios: [
        { codigo: '62.09-1-00', descricao: 'Suporte técnico, manutenção e outros serviços em tecnologia da informação' },
        { codigo: '63.11-9-00', descricao: 'Tratamento de dados, provedores de serviços de aplicação e serviços de hospedagem na internet' },
        { codigo: '62.02-3-00', descricao: 'Desenvolvimento e licenciamento de programas de computador customizáveis' },
        { codigo: '62.01-5-01', descricao: 'Desenvolvimento de programas de computador sob encomenda' },
        { codigo: '62.03-1-00', descricao: 'Desenvolvimento e licenciamento de programas de computador não-customizáveis' },
    ],
};

const CompanyInfoModal = ({ isOpen, onClose }) => {
    // Fechar com Escape
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    // Bloquear scroll do body
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const { endereco: e } = COMPANY;
    const enderecoFormatado = `${e.logradouro}, ${e.numero} — ${e.complemento}`;
    const cidadeFormatada   = `${e.bairro}, ${e.municipio} — ${e.uf}`;

    return (
        <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
            <div className={styles.modal} onClick={ev => ev.stopPropagation()}>

                {/* ── Cabeçalho ── */}
                <div className={styles.modalHeader}>
                    <div className={styles.headerBrand}>
                        <Building2 size={18} className={styles.headerIcon} />
                        <span>Dados da Empresa</span>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
                        <X size={18} />
                    </button>
                </div>

                <div className={styles.body}>

                    {/* ══ BLOCO 1 — Identificação ══ */}
                    <section className={styles.section}>
                        {/* CNPJ em destaque */}
                        <div className={styles.cnpjBadge}>
                            <Hash size={13} />
                            <span className={styles.cnpjLabel}>CNPJ</span>
                            <span className={styles.cnpjValue}>{COMPANY.cnpj}</span>
                            <span className={styles.tipoTag}>{COMPANY.tipo}</span>
                        </div>

                        {/* Nome empresarial */}
                        <div className={styles.nomeBlock}>
                            <p className={styles.nomeEmpresarial}>{COMPANY.nomeEmpresarial}</p>
                            <p className={styles.nomeFantasia}>
                                <span className={styles.fieldLabel}>Nome de Fantasia</span>
                                {COMPANY.nomeFantasia}
                            </p>
                        </div>

                        {/* Data de abertura + Natureza */}
                        <div className={styles.metaRow}>
                            <div className={styles.metaItem}>
                                <Calendar size={13} className={styles.metaIcon} />
                                <span className={styles.metaLabel}>Abertura</span>
                                <span className={styles.metaValue}>{COMPANY.dataAbertura}</span>
                            </div>
                            <div className={styles.metaDivider} />
                            <div className={styles.metaItem}>
                                <BadgeCheck size={13} className={styles.metaIcon} />
                                <span className={styles.metaLabel}>Natureza Jurídica</span>
                                <span className={styles.metaValue}>{COMPANY.naturezaJuridica}</span>
                            </div>
                        </div>
                    </section>

                    {/* ══ BLOCO 2 — Endereço ══ */}
                    <section className={styles.section}>
                        <div className={styles.sectionTitle}>
                            <MapPin size={14} className={styles.sectionIcon} />
                            Endereço
                        </div>
                        <div className={styles.addressCard}>
                            <p className={styles.addressMain}>{enderecoFormatado}</p>
                            <p className={styles.addressSub}>{cidadeFormatada}</p>
                            <p className={styles.addressCep}>CEP {e.cep}</p>
                        </div>
                    </section>

                    {/* ══ BLOCO 3 — Atividades Econômicas ══ */}
                    <section className={styles.section}>
                        <div className={styles.sectionTitle}>
                            <Briefcase size={14} className={styles.sectionIcon} />
                            Atividades Econômicas
                        </div>

                        {/* CNAE Principal */}
                        <div className={styles.cnaePrincipalCard}>
                            <span className={styles.cnaeTag}>Principal</span>
                            <div className={styles.cnaeRow}>
                                <code className={styles.cnaeCodigo}>{COMPANY.cnaePrincipal.codigo}</code>
                                <span className={styles.cnaeDesc}>{COMPANY.cnaePrincipal.descricao}</span>
                            </div>
                        </div>

                        {/* CNAEs Secundários */}
                        <div className={styles.cnaesSecList}>
                            {COMPANY.cnaesSecundarios.map((c) => (
                                <div key={c.codigo} className={styles.cnaeSecItem}>
                                    <code className={styles.cnaeSecCodigo}>{c.codigo}</code>
                                    <span className={styles.cnaeSecDesc}>{c.descricao}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CompanyInfoModal;
