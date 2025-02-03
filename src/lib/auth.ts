import { supabase } from './supabase';
    import type { User } from '@supabase/supabase-js';
    
    export async function signIn(email: string, password: string) {
      if (!email || !password) {
        throw new Error('Email et mot de passe requis');
      }
    
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });
    
        if (error) throw error;
    
        // Récupérer les données utilisateur étendues
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
    
        if (userError) throw userError;
    
        // Mettre à jour la date de dernière connexion
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id);
    
        return {
          ...data,
          user: {
            ...data.user,
            ...userData
          }
        };
      } catch (error) {
        console.error('Erreur de connexion:', error);
        throw error;
      }
    }
    
    export async function signUp(email: string, password: string, role: 'admin' | 'staff' | 'customer' = 'customer') {
      if (!email || !password) {
        throw new Error('Email et mot de passe requis');
      }
    
      if (password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }
    
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { role }
          }
        });
    
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Erreur d\'inscription:', error);
        throw error;
      }
    }
    
    export async function signOut() {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (error) {
        console.error('Erreur de déconnexion:', error);
        throw error;
      }
    }
    
    export async function getCurrentUser() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        if (!session) {
          return null;
        }
    
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
    
        if (!user) {
          return null;
        }
    
        // Récupérer les données étendues de l'utilisateur
        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
    
        if (userDataError) throw userDataError;
    
        return {
          ...user,
          ...userData
        };
      } catch (error) {
        console.error('Erreur de récupération de l\'utilisateur:', error);
        return null;
      }
    }
    
    export function onAuthStateChange(callback: (user: User | null) => void) {
      return supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Récupérer les données étendues
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
    
          // Mettre à jour la date de dernière connexion
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', session.user.id);
    
          callback(userData ? { ...session.user, ...userData } : session.user);
        } else {
          callback(session?.user || null);
        }
      });
    }
