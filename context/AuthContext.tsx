import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '../types';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            if (data) {
                setProfile({
                    id: data.id,
                    fullName: data.full_name,
                    avatarUrl: data.avatar_url,
                    role: data.role,
                });
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!mounted) return;

                if (session?.user) {
                    setUser(session.user);
                    // Don't await this, let it load in the background
                    fetchProfile(session.user.id);
                } else {
                    setUser(null);
                    setProfile(null);
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
                setUser(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!mounted) return;

            console.log(`Auth event [${event}]`, session?.user?.id);

            if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);
                setLoading(false);
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                setUser(session?.user ?? null);
                if (session?.user) {
                    fetchProfile(session.user.id);
                }
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            // Re-re-seed local state immediately for fast UI
            setUser(null);
            setProfile(null);
            await supabase.auth.signOut();
        } catch (err) {
            console.error('Sign out error:', err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
