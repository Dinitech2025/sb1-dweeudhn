import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, onAuthStateChange } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isStaff: false,
  isCustomer: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier l'utilisateur courant
    const initAuth = async () => {
      try {
        const user = await getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // S'abonner aux changements d'authentification
    const { data: { subscription } } = onAuthStateChange(user => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Déterminer le rôle de l'utilisateur
  const userRole = user?.role || 'customer';
  const isAdmin = userRole === 'admin';
  const isStaff = userRole === 'staff';
  const isCustomer = userRole === 'customer';

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      isAdmin,
      isStaff,
      isCustomer
    }}>
      {children}
    </AuthContext.Provider>
  );
};
