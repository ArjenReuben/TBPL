// Import React library and hooks.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
// Import API function to fetch tickets for a specific client.
import { getTicketsByClientId } from '../services/api';
// Import the useAuth hook to get the current user's data.
import { useAuth } from '../hooks/useAuth';
// Import enums and type definitions.
import { Status } from '../types';
import type { Ticket } from '../types';
// Import reusable components.
import StatCard from '../components/StatCard';
import TicketList from '../components/TicketList';
import Spinner from '../components/Spinner';
import Header from '../components/Header';
import TicketDetails from '../components/TicketDetails';
import CreateTicketModal from '../components/CreateTicketModal';
// Import SVG icons.
import { TicketIcon, ClockIcon, CheckCircleIcon, ArchiveIcon } from '../components/Icons';

/**
 * The main dashboard page for logged-in clients.
 * It displays their tickets, stats, and allows navigation between list and detail views.
 * @returns {React.ReactElement} The rendered client dashboard.
 */
const ClientDashboard: React.FC = () => {
    // Get the current user from the authentication context.
    const { user } = useAuth();
    // State to store the client's tickets.
    const [tickets, setTickets] = useState<Ticket[]>([]);
    // State to manage the loading status.
    const [loading, setLoading] = useState(true);
    // State to store any error messages.
    const [error, setError] = useState<string | null>(null);

    // State to manage the currently selected ticket for the detail view.
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    // State to control the visibility of the "Create Ticket" modal.
    const [isModalOpen, setIsModalOpen] = useState(false);
    // State to trigger a data refresh. Incrementing this value re-runs the fetch effect.
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // useCallback hook to memoize the ticket fetching function.
    const fetchTickets = useCallback(async () => {
        // Do not fetch if there is no user logged in or user has no ID.
        if (!user || !user.id) return;
        // Use a try-catch-finally block for error handling.
        try {
            // Set loading to true before the fetch.
            setLoading(true);
            // Fetch tickets specifically for the logged-in user's ID.
            const data = await getTicketsByClientId(user.id);
            // Set the fetched tickets into state.
            setTickets(data);
        } catch (err) {
            // Set an error message if the fetch fails.
            setError('Failed to fetch tickets.');
            // Log the actual error to the console.
            console.error(err);
        } finally {
            // Set loading to false after the fetch is complete.
            setLoading(false);
        }
    }, [user]); // The dependency array ensures this function is recreated if the user object changes.

    // useEffect hook to call `fetchTickets` when the component mounts or when a refresh is triggered.
    useEffect(() => {
        fetchTickets();
    }, [fetchTickets, refreshTrigger]);

    // useCallback to memoize the ticket selection handler.
    const handleSelectTicket = useCallback((ticket: Ticket) => {
        setSelectedTicket(ticket);
    }, []);

    // useCallback to memoize the handler for returning to the dashboard view.
    const handleBackToDashboard = useCallback(() => {
        setSelectedTicket(null);
    }, []);

    // useCallback to memoize the function to open the modal.
    const openModal = useCallback(() => setIsModalOpen(true), []);
    // useCallback to memoize the function to close the modal.
    const closeModal = useCallback(() => setIsModalOpen(false), []);

    // Handler specifically for when a new ticket is created from the modal.
    const handleTicketCreated = useCallback(() => {
        // Close the modal.
        closeModal();
        // Trigger a full refresh of the ticket list from the server.
        setRefreshTrigger(prev => prev + 1);
    }, [closeModal]);

    // Handler for when an existing ticket is updated from the details view.
    const handleTicketUpdated = useCallback((updatedTicket: Ticket) => {
        // Update the main list of tickets in state without a full refetch.
        setTickets(prevTickets =>
            prevTickets.map(t => (t.id === updatedTicket.id ? updatedTicket : t))
        );
        // Crucially, update the selectedTicket state to refresh the details view with new data.
        setSelectedTicket(updatedTicket);
    }, []);


    // useMemo hook to calculate statistics based on the tickets. It only re-calculates when `tickets` changes.
    const stats = useMemo(() => {
        return {
            // Total number of tickets.
            total: tickets.length,
            // Number of open tickets.
            open: tickets.filter(t => t.status === Status.Open).length,
            // Number of in-progress tickets.
            inProgress: tickets.filter(t => t.status === Status.InProgress).length,
            // Number of tickets that are either Resolved or Closed.
            resolved: tickets.filter(t => t.status === Status.Resolved || t.status === Status.Closed).length,
        };
    }, [tickets]);

    // Create a usersMap containing only the current user, as required by the TicketList component.
    const usersMap = useMemo(() => {
        if (!user) return {};
        return { [user.id]: user };
    }, [user]);

    // A function to conditionally render the main content of the page.
    const renderContent = () => {
        // If loading, show a spinner.
        if (loading) {
            return <div className="flex justify-center items-center h-96"><Spinner /></div>;
        }

        // If an error occurred, show the error message.
        if (error) {
            return <div className="text-center text-red-500">{error}</div>;
        }
        
        // If a ticket is selected, show the TicketDetails view.
        if (selectedTicket) {
             return <TicketDetails 
                ticket={selectedTicket} 
                onBack={handleBackToDashboard}
                onTicketUpdate={handleTicketUpdated}
            />
        }

        // Otherwise, show the main dashboard view (stats and ticket list).
        return (
             <div className="space-y-8">
                {/* Grid of statistics cards. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Tickets" value={stats.total} colorClass="bg-blue-100" icon={<TicketIcon className="h-6 w-6 text-blue-600" />} />
                    <StatCard title="Open" value={stats.open} colorClass="bg-yellow-100" icon={<ClockIcon className="h-6 w-6 text-yellow-600" />} />
                    <StatCard title="In Progress" value={stats.inProgress} colorClass="bg-indigo-100" icon={<ArchiveIcon className="h-6 w-6 text-indigo-600" />} />
                    <StatCard title="Resolved/Closed" value={stats.resolved} colorClass="bg-green-100" icon={<CheckCircleIcon className="h-6 w-6 text-green-600" />} />
                </div>
                {/* The list of the client's tickets. */}
                <TicketList tickets={tickets} onSelectTicket={handleSelectTicket} usersMap={usersMap} />
            </div>
        )
    };

    // The JSX for the entire page.
    return (
         <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
            {/* Render the header, passing the modal-opening function. */}
            <Header onNewTicketClick={openModal} />
            {/* The main content area. */}
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Call the render function to display the correct content. */}
                {renderContent()}
            </main>
            {/* Conditionally render the "Create Ticket" modal. */}
            {isModalOpen && (
                <CreateTicketModal 
                    onClose={closeModal} 
                    onTicketCreated={handleTicketCreated} 
                />
            )}
        </div>
    );
};

// Export the component.
export default ClientDashboard;