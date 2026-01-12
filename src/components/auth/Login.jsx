import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import styles from './Auth.module.css';

// Logo from public folder
const defyLogo = '/defy-logo-bh-removebg-preview.png';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async () => {
        try {
            setLoading(true);
            setError(null);

            const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin;
            console.log('Login Redirect URL:', redirectUrl);

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'azure',
                options: {
                    scopes: 'email',
                    redirectTo: redirectUrl,
                    queryParams: {
                        prompt: 'select_account'
                    }
                }
            });
            if (error) throw error;
        } catch (err) {
            console.error('Login error:', err);
            setError('Falha ao iniciar login com Microsoft 365.');
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.authLogo}>
                    <img src={defyLogo} alt="Defy Solutions" />
                </div>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '1.5rem' }}>
                        Portal Corporativo
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                        Faça login com sua conta corporativa para continuar.
                    </p>
                </div>

                {error && (
                    <div className={styles.authError}>
                        {error}
                    </div>
                )}

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className={styles.loginButton}
                >
                    {loading ? 'Redirecionando...' : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#F35325" d="M11 11H1V1H11V11Z" />
                                <path fill="#81BC06" d="M22 11H12V1H22V11Z" />
                                <path fill="#05A6F0" d="M11 22H1V12H11V22Z" />
                                <path fill="#FFBA08" d="M22 22H12V12H22V22Z" />
                            </svg>
                            Entrar com Microsoft 365
                        </>
                    )}
                </button>

                <div className={styles.authFooter}>
                    Apenas contas com domínio <strong>defysolutions.com.br</strong> são permitidas.
                </div>
            </div>
        </div>
    );
};

export default Login;
