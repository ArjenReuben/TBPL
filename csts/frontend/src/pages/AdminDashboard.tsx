// Import React library and hooks.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
// Import API functions to fetch all tickets and all users.
import { getTickets, getUsers } from '../services/api';
// Import enums and type definitions.
import { Status, UserRole } from '../types';
import type { Ticket, User } from '../types';

// Import reusable components.
import StatCard from '../components/StatCard';
import TicketList from '../components/TicketList';
import UserList from '../components/UserList';
import Spinner from '../components/Spinner';
import Header from '../components/Header';
import TicketDetails from '../components/TicketDetails';
import CreateTicketModal from '../components/CreateTicketModal';
import CreateUserModal from '../components/CreateUserModal';
import FilterBar from '../components/FilterBar';

// Import SVG icons, aliasing UserIcon to avoid a name conflict.
import { TicketIcon, ClockIcon, CheckCircleIcon, ArchiveIcon, UserIcon as SupportUserIcon } from '../components/Icons';

/**
 * The main dashboard page for administrators. It features a tabbed interface
 * to manage tickets, clients, and staff members.
 * @returns {React.ReactElement} The rendered admin dashboard.
 */
const AdminDashboard: React.FC = () => {
    // State to store the complete list of all tickets.
    const [allTickets, setAllTickets] = useState<Ticket[]>([]);
    // State to store the complete list of all users.
    const [allUsers, setAllUsers] = useState<User[]>([]);
    // State for loading status.
    const [loading, setLoading] = useState(true);
    // State for error messages.
    const [error, setError] = useState<string | null>(null);

    // State for the currently selected ticket detail view.
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    // State for the "Create Ticket" modal visibility.
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    // State for the "Create User" modal visibility.
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    // State to trigger a data refresh.
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // State for the text search input.
    const [searchTerm, setSearchTerm] = useState('');
    // State for the ticket status filter.
    const [statusFilter, setStatusFilter] = useState('All');
    // State for the ticket priority filter.
    const [priorityFilter, setPriorityFilter] = useState('All');
    
    // State to manage the active tab ('tickets', 'clients', or 'staff').
    const [activeTab, setActiveTab] = useState<'tickets' | 'clients' | 'staff'>('tickets');

    // useCallback to memoize the main data fetching function.
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch tickets and users data in parallel for efficiency.
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

    // useEffect to run the fetch function on mount and when a refresh is triggered.
    useEffect(() => {
        fetchData();
    }, [fetchData, refreshTrigger]);
    
    // useMemo to create a map of User IDs to User objects for efficient lookups.
    const usersMap = useMemo(() => {
        const map: Record<number, User> = {};
        allUsers.forEach(user => { map[user.id] = user; });
        return map;
    }, [allUsers]);

    // useMemo to calculate the filtered list of tickets based on current filter states.
    const filteredTickets = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        return allTickets.filter(ticket => {
            const statusMatch = statusFilter === 'All' || ticket.status === statusFilter;
            const priorityMatch = priorityFilter === 'All' || ticket.priority === priorityFilter;
            const clientName = usersMap[ticket.clientId]?.name.toLowerCase() || '';
            const searchMatch = lowercasedFilter === '' ||
                ticket.issue.toLowerCase().includes(lowercasedFilter) ||
                String(ticket.id).includes(lowercasedFilter) ||
                clientName.includes(lowercasedFilter);
            return statusMatch && priorityMatch && searchMatch;
        });
    }, [allTickets, searchTerm, statusFilter, priorityFilter, usersMap]);

    // useMemo to separate the `allUsers` array into clients and staff lists.
    const { clients, staff } = useMemo(() => ({
        clients: allUsers.filter(u => u.role === UserRole.Client),
        staff: allUsers.filter(u => u.role === UserRole.Staff),
    }), [allUsers]);
    
    // Callback handlers for UI interactions, memoized with useCallback.
    const handleSelectTicket = useCallback((ticket: Ticket) => setSelectedTicket(ticket), []);
    const handleBackToDashboard = useCallback(() => setSelectedTicket(null), []);
    const openTicketModal = useCallback(() => setIsTicketModalOpen(true), []);
    const closeTicketModal = useCallback(() => setIsTicketModalOpen(false), []);
    const openUserModal = useCallback(() => setIsUserModalOpen(true), []);
    const closeUserModal = useCallback(() => setIsUserModalOpen(false), []);

    // A general handler for after modals are used (creation), which triggers a full refresh.
    const handleCreated = useCallback(() => {
        closeTicketModal();
        closeUserModal();
        setRefreshTrigger(prev => prev + 1);
    }, [closeTicketModal, closeUserModal]);
    
    // A specific handler for when a ticket is updated from the details view.
    const handleTicketUpdated = useCallback((updatedTicket: Ticket) => {
        // Update the main list of tickets in state without a full refetch.
        setAllTickets(prevTickets =>
            prevTickets.map(t => (t.id === updatedTicket.id ? updatedTicket : t))
        );
        // Crucially, update the selectedTicket state to refresh the details view.
        setSelectedTicket(updatedTicket);
    }, []);


    // useMemo to calculate ticket statistics.
    const ticketStats = useMemo(() => ({
        total: allTickets.length,
        open: allTickets.filter(t => t.status === Status.Open).length,
        inProgress: allTickets.filter(t => t.status === Status.InProgress).length,
        resolved: allTickets.filter(t => t.status === Status.Resolved).length,
    }), [allTickets]);

    // A function to render the content based on the active tab.
    const renderDashboardContent = () => {
        switch (activeTab) {
            case 'clients':
                return <UserList users={clients} title="All Clients" />;
            case 'staff':
                return <UserList users={staff} title="All Staff" />;
            case 'tickets':
            default:
                return (
                    <div className="space-y-8">
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title="Total Tickets" value={ticketStats.total} colorClass="bg-blue-100" icon={<TicketIcon className="h-6 w-6 text-blue-600" />} />
                            <StatCard title="Open" value={ticketStats.open} colorClass="bg-yellow-100" icon={<ClockIcon className="h-6 w-6 text-yellow-600" />} />
                            <StatCard title="In Progress" value={ticketStats.inProgress} colorClass="bg-indigo-100" icon={<ArchiveIcon className="h-6 w-6 text-indigo-600" />} />
                            <StatCard title="Resolved" value={ticketStats.resolved} colorClass="bg-green-100" icon={<CheckCircleIcon className="h-6 w-6 text-green-600" />} />
                        </div>
                        <FilterBar
                            searchTerm={searchTerm}
                            statusFilter={statusFilter}
                            priorityFilter={priorityFilter}
                            onSearchChange={setSearchTerm}
                            onStatusChange={setStatusFilter}
                            onPriorityChange={setPriorityFilter}
                        />
                        <TicketList tickets={filteredTickets} usersMap={usersMap} onSelectTicket={handleSelectTicket} />
                    </div>
                );
        }
    };
    
    // A function to render the main content of the entire page (either dashboard or details view).
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
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
                        <p className="text-slate-500">Manage tickets, clients, and staff.</p>
                    </div>
                    {activeTab !== 'tickets' && (
                        <button
                            onClick={openUserModal}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-secondary rounded-lg shadow-sm hover:bg-opacity-90"
                        >
                            <SupportUserIcon className="h-5 w-5" />
                            Create New User
                        </button>
                    )}
                </div>
                
                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('tickets')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tickets' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Tickets</button>
                        <button onClick={() => setActiveTab('clients')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'clients' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Clients</button>
                        <button onClick={() => setActiveTab('staff')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'staff' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Staff</button>
                    </nav>
                </div>
                {renderDashboardContent()}
            </div>
        );
    };

    // The JSX for the entire page.
    return (
         <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
            <Header onNewTicketClick={openTicketModal} />
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {renderContent()}
            </main>
            {isTicketModalOpen && (
                <CreateTicketModal 
                    onClose={closeTicketModal} 
                    onTicketCreated={handleCreated} 
                />
            )}
            {isUserModalOpen && (
                <CreateUserModal
                    onClose={closeUserModal}
                    onUserCreated={handleCreated}
                />
            )}
        </div>
    );
};

// Export the component.
export default AdminDashboard;