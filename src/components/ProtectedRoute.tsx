import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../services/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const isAuth = isAuthenticated();
  const userRole = getUserRole();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    // Redirigir a una página de acceso denegado o a la página principal del rol del usuario
    return <Navigate to={userRole === 'admin' ? '/admin-dashboard' : '/vendedor-dashboard'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;