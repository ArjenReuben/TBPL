// FIX: Replaced placeholder content with a full implementation.
// This component now sets up the authentication provider and handles routing.
import React from 'react';
// FIX: Corrected the import path for useAuth. It is in its own hook file.
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { UserRole } from './types';
import Login from './pages/Login';
import StaffLogin from './pages/StaffLogin';
import AdminLogin from './pages/AdminLogin';
import ClientDashboard from './pages/ClientDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Spinner from './components/Spinner';

/**
 * The AppContent component determines which page to render based on the
 * authentication state and the current URL path.
 */
const AppContent: React.FC = () => {
    const { user, loading } = useAuth();

    // While checking for a persisted auth session, display a loading spinner.
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-100">
                <Spinner />
            </div>
        );
    }

    // If a user is logged in, render the appropriate dashboard based on their role.
    if (user) {
        switch (user.role) {
            case UserRole.Client:
                return <ClientDashboard />;
            case UserRole.Staff:
                return <StaffDashboard />;
            case UserRole.Admin:
                return <AdminDashboard />;
            default:
                // As a fallback, if the user role is unknown, show the client login page.
                return <Login />;
        }
    }
    
    // If no user is logged in, use the URL path to show the correct login page.
    const path = window.location.pathname;
    if (path.startsWith('/staff-login')) {
        return <StaffLogin />;
    }
    if (path.startsWith('/admin-login')) {
        return <AdminLogin />;
    }
    // By default, show the client login page.
    return <Login />;
};

/**
 * The main App component, which wraps the entire application with the
 * AuthProvider to make authentication state available everywhere.
 */
const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;