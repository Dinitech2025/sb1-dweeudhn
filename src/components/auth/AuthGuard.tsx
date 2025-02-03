import React from 'react';
    import { Navigate, useLocation } from 'react-router-dom';
    import { useAuth } from './AuthProvider';
    
    interface AuthGuardProps {
      children: React.ReactNode;
      requireAdmin?: boolean;
      requireStaff?: boolean;
    }
    
    export const AuthGuard: React.FC<AuthGuardProps> = ({ 
      children, 
      requireAdmin = false,
      requireStaff = false
    }) => {
      const { user, loading, isAdmin, isStaff } = useAuth();
      const location = useLocation();
    
      if (loading) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        );
      }
    
      if (!user) {
        // Sauvegarder l'URL de retour pour la redirection après connexion
        return <Navigate to="/login" state={{ returnUrl: location.pathname }} />;
      }
    
      if (requireAdmin && !isAdmin) {
        return <Navigate to="/" />;
      }
    
      if (requireStaff && !isStaff && !isAdmin) {
        return <Navigate to="/" />;
      }
    
      return <>{children}</>;
    };
