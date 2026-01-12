import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Spinner } from '@iadefysolutions/design-system';

const ALLOWED_DOMAIN = 'defysolutions.com.br';

const DomainGuard = ({ children }) => {
    const { user, loading } = useAuth();
    const [status, setStatus] = useState('checking'); // checking | allowed | blocked

    useEffect(() => {
        if (loading) return;

        if (!user) {
            setStatus('unauthenticated');
            return;
        }

        const domain = user.email?.split('@')[1]?.toLowerCase();
        if (domain !== ALLOWED_DOMAIN) {
            setStatus('blocked');
        } else {
            setStatus('allowed');
        }
    }, [user, loading]);

    if (loading || status === 'checking') {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: 'var(--bg-main)'
            }}>
                <Spinner size="lg" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return <Navigate to="/login" replace />;
    }

    if (status === 'blocked') {
        return (
            <div style={{
                padding: '32px',
                maxWidth: 500,
                margin: '40px auto',
                textAlign: 'center',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--border-radius-lg)',
                boxShadow: 'var(--shadow-md)'
            }}>
                <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Acesso restrito</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Somente contas com domínio <strong>{ALLOWED_DOMAIN}</strong> podem acessar este sistema.
                </p>
                <button
                    onClick={() => window.location.href = '/login'}
                    style={{
                        marginTop: '16px',
                        padding: '12px 24px',
                        cursor: 'pointer',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--border-radius-sm)',
                        fontSize: '1rem'
                    }}
                >
                    Voltar para Login
                </button>
            </div>
        );
    }

    return children;
};

const ProtectedRoute = ({ children }) => {
    return (
        <DomainGuard>{children}</DomainGuard>
    );
};

export default ProtectedRoute;
