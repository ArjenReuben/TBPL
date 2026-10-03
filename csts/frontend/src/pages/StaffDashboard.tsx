// Import React library and hooks.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
// Import API functions to fetch all tickets and users.
import { getTickets, getUsers } from '../services/api';
// Import enums and type definitions.
import { Status } from '../types';
import type { Ticket, User } from '../types';
// Import reusable components.
import StatCard from '../components/StatCard';
import TicketList from '../components/TicketList';
import Spinner from '../components/Spinner';
import Header from '../components/Header';
import TicketDetails from '../components/TicketDetails';
import FilterBar from '../components/FilterBar';
// Import SVG icons.
import { TicketIcon, ClockIcon, CheckCircleIcon, ArchiveIcon } from '../components/Icons';

/**
 * The main dashboard page for logged-in staff members.
 * It displays all tickets, stats, filtering options, and allows navigation to detail views.
 * @returns {React.ReactElement} The rendered staff dashboard.
 */
const StaffDashboard: React.FC = () => {
    // State to store the complete list of all tickets from the API.
    const [allTickets, setAllTickets] = useState<Ticket[]>([]);
    // State to store all users, needed for searching by client name.
    const [allUsers, setAllUsers] = useState<User[]>([]);
    // State to manage the loading status.
    const [loading, setLoading] = useState(true);
    // State to store any error messages.
    const [error, setError] = useState<string | null>(null);

    // State to manage the currently selected ticket for the detail view.
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    
    // State for the text search input.
    const [searchTerm, setSearchTerm] = useState('');
    // State for the status filter dropdown. 'All' is the default.
    const [statusFilter, setStatusFilter] = useState('All');
    // State for the priority filter dropdown. 'All' is the default.
    const [priorityFilter, setPriorityFilter] = useState('All');

    // useCallback to memoize the data fetching function.
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch tickets and users in parallel for efficiency.
            const [ticketsData, usersData] = await Promise.all([getTickets(), getUsers()]);
            setAllTickets(ticketsData);
            setAllUsers(usersData);
        } catch (err) {
            setError('Failed to fetch data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // useEffect hook to call `fetchData` on mount.
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // useMemo to create a map of User IDs to User objects for efficient lookups.
    const usersMap = useMemo(() => {
        const map: Record<number, User> = {};
        allUsers.forEach(user => { map[user.id] = user; });
        return map;
    }, [allUsers]);

    // useMemo to calculate the list of filtered tickets. This re-runs only when the source data or filters change.
    const filteredTickets = useMemo(() => {
        // Prepare the search term for case-insensitive matching.
        const lowercasedFilter = searchTerm.toLowerCase();
        
        // Start with the full list of tickets.
        return allTickets.filter(ticket => {
            // Check status filter.
            const statusMatch = statusFilter === 'All' || ticket.status === statusFilter;
            // Check priority filter.
            const priorityMatch = priorityFilter === 'All' || ticket.priority === priorityFilter;

            // Get the client's name from the usersMap.
            const clientName = usersMap[ticket.clientId]?.name.toLowerCase() || '';

            // Check search term filter.
            const searchMatch = lowercasedFilter === '' ||
                // Match against the ticket issue.
                ticket.issue.toLowerCase().includes(lowercasedFilter) ||
                // Match against the ticket ID.
                String(ticket.id).includes(lowercasedFilter) ||
                // Match against the client's name.
                clientName.includes(lowercasedFilter);
            
            // A ticket is included only if it matches all active filters.
            return statusMatch && priorityMatch && searchMatch;
        });
    }, [allTickets, searchTerm, statusFilter, priorityFilter, usersMap]); // Dependencies for the memoization.
    
    // Callback handlers, memoized with useCallback.
    const handleSelectTicket = useCallback((ticket: Ticket) => setSelectedTicket(ticket), []);
    const handleBackToDashboard = useCallback(() => setSelectedTicket(null), []);
    
    // Handler for when an existing ticket is updated from the details view.
    const handleTicketUpdated = useCallback((updatedTicket: Ticket) => {
        // Update the main list of tickets in state without a full refetch.
        setAllTickets(prevTickets =>
            prevTickets.map(t => (t.id === updatedTicket.id ? updatedTicket : t))
        );
        // Crucially, update the selectedTicket state to refresh the details view with new data.
        setSelectedTicket(updatedTicket);
    }, []);


    // useMemo to calculate statistics based on all tickets.
    const stats = useMemo(() => {
        return {
            total: allTickets.length,
            open: allTickets.filter(t => t.status === Status.Open).length,
            inProgress: allTickets.filter(t => t.status === Status.InProgress).length,
            resolved: allTickets.filter(t => t.status === Status.Resolved).length,
        };
    }, [allTickets]);

    // A function to conditionally render the main content of the page.
    const renderContent = () => {
        if (loading) return <div className="flex justify-center items-center h-96"><Spinner /></div>;
        if (error) return <div className="text-center text-red-500">{error}</div>;
        
        if (selectedTicket) {
             return <TicketDetails 
                ticket={selectedTicket} 
                onBack={handleBackToDashboard}
                onTicketUpdate={handleTicketUpdated}
            />
        }

        return (
             <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Tickets" value={stats.total} colorClass="bg-blue-100" icon={<TicketIcon className="h-6 w-6 text-blue-600" />} />
                    <StatCard title="Open" value={stats.open} colorClass="bg-yellow-100" icon={<ClockIcon className="h-6 w-6 text-yellow-600" />} />
                    <StatCard title="In Progress" value={stats.inProgress} colorClass="bg-indigo-100" icon={<ArchiveIcon className="h-6 w-6 text-indigo-600" />} />
                    <StatCard title="Resolved" value={stats.resolved} colorClass="bg-green-100" icon={<CheckCircleIcon className="h-6 w-6 text-green-600" />} />
                </div>
                {/* The filter bar component with search functionality. */}
                <FilterBar
                    searchTerm={searchTerm}
                    statusFilter={statusFilter}
                    priorityFilter={priorityFilter}
                    onSearchChange={setSearchTerm}
                    onStatusChange={setStatusFilter}
                    onPriorityChange={setPriorityFilter}
                />
                {/* The list of tickets, showing the filtered results. */}
                <TicketList tickets={filteredTickets} usersMap={usersMap} onSelectTicket={handleSelectTicket} />
            </div>
        )
    };

    // The JSX for the entire page.
    return (
         <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
            {/* Render the header. Staff do not create new tickets, so pass an empty function. */}
            <Header onNewTicketClick={() => {}} /> 
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {renderContent()}
            </main>
        </div>
    );
};

// Export the component.
export default StaffDashboard;