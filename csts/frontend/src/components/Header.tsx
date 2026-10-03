// Import the React library.
import React from 'react';
// Import the useAuth hook to access authentication state (user) and functions (logout).
import { useAuth } from '../hooks/useAuth';
// Import custom SVG icons.
import { PlusIcon, LogoutIcon } from './Icons';
// Import the UserRole enum for role-based conditional rendering.
import { UserRole } from '../types';
// Import the New Horizons logo.
import nhLogo from '../assets/nh-logo-full.png';

// Define the interface for the props that the Header component accepts.
interface HeaderProps {
    // A function to be called when the "New Ticket" button is clicked.
    onNewTicketClick: () => void;
}

/**
 * The application's main header component. It displays the app title, user info,
 * and context-aware action buttons (New Ticket, Logout).
 * @param {HeaderProps} props - The properties passed to the component.
 * @returns {React.ReactElement} The rendered header.
 */
const Header: React.FC<HeaderProps> = ({ onNewTicketClick }) => {
    // Get the current user and logout function from the authentication context.
    const { user, logout } = useAuth();

    // The JSX returned by the component.
    return (
        // The header element with styling for background, shadow, and positioning.
        <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-20 border-b border-slate-200">
            {/* A container to limit width and center content. */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* A flex container to align items on the same line. */}
                <div className="flex justify-between items-center h-16">
                    {/* Left side of the header: logo and title. */}
                    <div className="flex items-center space-x-3">
                        {/* New Horizons logo. */}
                        <img src={nhLogo} alt="New Horizons" className="h-8 object-contain" />
                        {/* Divider */}
                        <div className="h-6 w-px bg-slate-200" />
                        {/* The application title. */}
                        <h1 className="text-lg font-semibold text-slate-800">
                            Support Desk
                        </h1>
                    </div>
                    {/* Right side of the header: user info and action buttons. */}
                    <div className="flex items-center gap-4">
                        {/* Conditionally render user information if a user is logged in. */}
                        {user && (
                            <div className="text-right">
                                {/* Display the user's name. */}
                                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                                {/* Display the user's role. */}
                                <p className="text-xs text-slate-500">{user.role}</p>
                            </div>
                        )}
                        {/* Conditionally render the "New Ticket" button ONLY for Clients. */}
                        {(user?.role === UserRole.Client) && (
                            <button
                                // Set the onClick handler.
                                onClick={onNewTicketClick}
                                // Apply styling, including hiding the button on small screens (`sm:inline-flex`).
                                className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-all"
                                // Add a title for accessibility and hover tooltips.
                                title="Create New Ticket"
                            >
                                {/* The plus icon inside the button. */}
                                <PlusIcon className="h-5 w-5" />
                                {/* The text label, hidden on medium screens and smaller (`md:inline`). */}
                                <span className="hidden md:inline">New Ticket</span>
                            </button>
                        )}
                         {/* Conditionally render the Logout button if a user is logged in. */}
                         {user && (
                            <button
                                // Set the onClick handler to call the logout function from the auth context.
                                onClick={logout}
                                // Apply styling for the button.
                                className="inline-flex items-center justify-center h-10 w-10 text-slate-500 bg-slate-100 rounded-full hover:bg-slate-200 hover:text-brand-primary transition"
                                // Add a title for accessibility.
                                title="Logout"
                            >
                                {/* The logout icon. */}
                                <LogoutIcon className="h-5 w-5" />
                            </button>
                         )}
                    </div>
                </div>
            </div>
        </header>
    );
};

// Export the Header component.
export default Header;