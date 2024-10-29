import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import VendedorDashboard from './pages/VendedorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserAdministration from './pages/UserAdministration';
import ProtectedRoute from './components/ProtectedRoute';
import AdminUserManagement from './pages/AdminUserManagement';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Vendor Routes */}
        <Route 
          path="/vendedor/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['vendedor']}>
              <VendedorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/vendedor/user-administration" 
          element={
            <ProtectedRoute allowedRoles={['vendedor']}>
              <UserAdministration />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/user-administration" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUserManagement/>
            </ProtectedRoute>
          } 
        />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch-all route for undefined paths */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;