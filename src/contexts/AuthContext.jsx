import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const isInitialLoad = useRef(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session, true);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            // Não mostrar loading em eventos subsequentes para evitar remontagem
            handleSession(session, false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSession = async (session, isInitial) => {
        if (!session?.user) {
            setUser(null);
            if (isInitial) setLoading(false);
            isInitialLoad.current = false;
            return;
        }

        const userEmail = session.user.email;
        if (!userEmail?.endsWith('@defysolutions.com.br')) {
            await supabase.auth.signOut();
            alert('Acesso restrito apenas para o domínio @defysolutions.com.br');
            setUser(null);
            if (isInitial) setLoading(false);
            isInitialLoad.current = false;
            return;
        }

        setUser(session.user);

        // Ensure profile exists
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle();

        if (!error && !data) {
            await supabase.from('profiles').insert({
                id: session.user.id,
                email: userEmail,
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || userEmail.split('@')[0],
                role: 'user',
            });
        }

        if (isInitial) setLoading(false);
        isInitialLoad.current = false;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const value = {
        user,
        loading,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
