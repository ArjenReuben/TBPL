// Import React library and hooks.
import React, { createContext, useState, useEffect, useCallback } from 'react';
// Import all functions from the authentication service, aliased as `authService`.
import * as authService from '../services/authService';
// Import the User type definition and UserRole enum.
import type { User } from '../types';
import { UserRole } from '../types';

// Define the interface for the shape of the authentication context.
interface AuthContextType {
    // The currently logged-in user object, or null if no one is logged in.
    user: User | null;
    // A boolean to indicate if the authentication state is still being determined (e.g., on initial load).
    loading: boolean;
    // An async function for standard user login.
    login: (email: string, password: string) => Promise<User | null>;
    // An async function for administrator login.
    loginAdmin: (password: string) => Promise<User | null>;
    // A function to log the user out.
    logout: () => void;
}

// Create the React Context for authentication. It's initially undefined.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * The AuthProvider component wraps the application and provides the authentication context
 * to all of its children.
 * @param {object} props - The component props, including children.
 * @returns {React.ReactElement} The rendered provider.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // State to hold the current user object.
    const [user, setUser] = useState<User | null>(null);
    // State to track the initial loading status.
    const [loading, setLoading] = useState(true);

    // useEffect hook to check for a persisted user session in localStorage on initial app load.
    useEffect(() => {
        // Retrieve the stored user from localStorage.
        const storedUser = localStorage.getItem('user');
        // If a user was found in storage...
        if (storedUser) {
            // ...parse the JSON string and set it as the current user state.
            setUser(JSON.parse(storedUser));
        }
        // Set loading to false after checking storage, allowing the app to render.
        setLoading(false);
    }, []); // Empty dependency array ensures this runs only once.

    // useCallback to memoize the login function.
    const login = useCallback(async (email: string, password: string) => {
        try {
            // Call the login function from the auth service.
            const loggedInUser = await authService.login(email, password);
            // If the login was successful and returned a user object...
            if (loggedInUser) {
                // ...persist the user object to localStorage.
                localStorage.setItem('user', JSON.stringify(loggedInUser));
                // ...set the user state.
                setUser(loggedInUser);
                // ...return the user object.
                return loggedInUser;
            }
            // If login failed, return null.
            return null;
        } catch (error) {
            // Handle any unexpected errors during login.
            console.error("Login failed:", error);
            return null;
        }
    }, []);

    // useCallback to memoize the admin login function.
    const loginAdmin = useCallback(async (password: string) => {
        try {
            // Call the admin login function from the auth service.
            const adminUser = await authService.loginAdmin(password);
            // If the login was successful...
            if (adminUser) {
                // ...persist the admin user object to localStorage.
                localStorage.setItem('user', JSON.stringify(adminUser));
                // ...set the user state.
                setUser(adminUser);
                // ...return the admin user object.
                return adminUser;
            }
            // If login failed, return null.
            return null;
        } catch (error) {
            // Handle errors.
            console.error("Admin login failed:", error);
            return null;
        }
    }, []);

    // useCallback to memoize the logout function.
    const logout = useCallback(() => {
        // Get the user's role *before* clearing the session.
        const userRole = user?.role;

        // Remove the user from localStorage.
        localStorage.removeItem('user');
        // Clear the user state.
        setUser(null);
        
        // Redirect based on the user's role for a better user experience.
        switch (userRole) {
            case UserRole.Staff:
                // If a staff member logs out, send them to the staff login page.
                window.location.href = '/staff/login';
                break;
            case UserRole.Admin:
                // If an admin logs out, send them to the admin portal entry.
                window.location.href = '/admin';
                break;
            case UserRole.Client:
            default:
                // By default, and for clients, send them to the main client login page.
                window.location.href = '/login';
                break;
        }
    }, [user]); // Add user to the dependency array to ensure the closure has the latest state.

    // The value object that will be provided by the context.
    const value = { user, loading, login, loginAdmin, logout };

    // Return the context provider, wrapping the children components.
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
