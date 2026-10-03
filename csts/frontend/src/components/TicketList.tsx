// Import React library.
import React from 'react';
// Import type definitions for Ticket and User.
import type { Ticket, User } from '../types';
// Import the TicketListItem component, which represents a single row in the list.
import TicketListItem from './TicketListItem';

// Define the interface for the props that the TicketList component accepts.
interface TicketListProps {
    // An array of ticket objects to be displayed.
    tickets: Ticket[];
    // A map of user IDs to user objects. This is passed from the parent to avoid re-fetching.
    usersMap: Record<number, User>;
    // A function to be called when a ticket row is clicked.
    onSelectTicket: (ticket: Ticket) => void;
}

/**
 * The TicketList component, which renders a table of tickets. It is a "dumb" component
 * that simply displays the data passed to it via props.
 * @param {TicketListProps} props - The properties passed to the component.
 * @returns {React.ReactElement} The rendered list of tickets.
 */
const TicketList: React.FC<TicketListProps> = ({ tickets, usersMap, onSelectTicket }) => {
    // The JSX returned by the component.
    return (
        // A container for the ticket list with styling.
        <div className="bg-white shadow-sm rounded-xl border border-slate-200/80 overflow-hidden">
            {/* The header section of the ticket list card. */}
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                 <h3 className="text-lg font-semibold text-slate-700">Tickets</h3>
                 <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{tickets.length} results</span>
            </div>
            {/* A container to allow horizontal scrolling on small screens if the table is too wide. */}
            <div className="overflow-x-auto">
                {/* The main table element. */}
                <table className="min-w-full divide-y divide-slate-200">
                    {/* The table header. */}
                    <thead className="bg-slate-50">
                        {/* The header row. */}
                        <tr>
                            {/* Header cell for the ticket subject/ID. */}
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket</th>
                            {/* Header cell for the client name. */}
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                            {/* Header cell for the priority. */}
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                            {/* Header cell for the status. */}
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            {/* Header cell for the last update time. */}
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Updated</th>
                        </tr>
                    </thead>
                    {/* The table body. */}
                    <tbody className="bg-white divide-y divide-slate-200">
                        {/* If there are no tickets, display a message row. */}
                        {tickets.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-slate-500">
                                    No tickets found.
                                </td>
                            </tr>
                        ) : (
                            // Otherwise, map over the `tickets` array to render a `TicketListItem` for each ticket.
                            tickets.map(ticket => (
                                <TicketListItem
                                    // A unique key is required for each item in a list for React to efficiently update the DOM.
                                    key={ticket.id}
                                    // Pass the ticket object to the child component.
                                    ticket={ticket}
                                    // Pass the corresponding client object from the pre-fetched map.
                                    client={usersMap[ticket.clientId]}
                                    // Pass the selection handler function.
                                    onSelectTicket={onSelectTicket}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Export the TicketList component as the default export.
export default TicketList;
