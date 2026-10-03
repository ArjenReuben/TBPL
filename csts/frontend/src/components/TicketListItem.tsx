
// Import the React library.
import React from 'react';
// Import type definitions for Ticket and User.
import type { Ticket, User } from '../types';
// Import the Badge component for displaying status and priority.
import Badge from './Badge';
// Import the useAuth hook to get the current user's information.
import { useAuth } from '../hooks/useAuth';
// Import the UserRole enum for role-based logic.
import { UserRole } from '../types';

// Define the interface for the props that the TicketListItem component accepts.
interface TicketListItemProps {
    // The ticket object for this row.
    ticket: Ticket;
    // The user object for the client associated with the ticket. It's optional as it might be loading.
    client?: User;
    // The function to call when this row is clicked.
    onSelectTicket: (ticket: Ticket) => void;
}

/**
 * Represents a single row in the ticket list table, with role-specific features like notification dots.
 * @param {TicketListItemProps} props - The properties passed to the component.
 * @returns {React.ReactElement} The rendered table row.
 */
const TicketListItem: React.FC<TicketListItemProps> = ({ ticket, client, onSelectTicket }) => {
    // Get the current user from the authentication context.
    const { user } = useAuth();

    // Determine the date of the last update. If there are no updates, use the ticket's creation date.
    const lastUpdateDate = ticket.updates.length > 0
        // Find the most recent date from the updates array.
        ? new Date(Math.max(...ticket.updates.map(u => new Date(u.date).getTime())))
        // Fallback to the creation date if there are no updates.
        : new Date(ticket.createdDate);

    // A helper function to format a date into a "time ago" string (e.g., "5 minutes ago").
    const timeAgo = (date: Date): string => {
        // Calculate the difference in seconds between now and the given date.
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        // Calculate interval in years.
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        // Calculate interval in months.
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        // Calculate interval in days.
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        // Calculate interval in hours.
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        // Calculate interval in minutes.
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        // Return interval in seconds.
        return Math.floor(seconds) + " seconds ago";
    };
    
    // Determine if the notification dot should be shown. It appears if the user is a client and the ticket has an unread update.
    const showNotificationDot = user?.role === UserRole.Client && ticket.clientHasUnreadUpdate;

    // The JSX for the table row.
    return (
        // The table row (`tr`) element. An onClick handler is attached to select the ticket.
        <tr onClick={() => onSelectTicket(ticket)} className="hover:bg-slate-50 cursor-pointer transition-colors duration-150">
            {/* Table data (`td`) cell for the ticket issue and ID. */}
            <td className="px-6 py-4 whitespace-nowrap">
                {/* A flex container to align the notification dot and the text. */}
                <div className="flex items-center gap-3">
                    {/* Conditionally render the blue notification dot. */}
                    {showNotificationDot && <div className="h-2.5 w-2.5 rounded-full bg-blue-500" title="Unread update"></div>}
                    {/* Container for the issue and ID text. */}
                    <div>
                        {/* The ticket's subject line. */}
                        <div className="text-sm font-semibold text-slate-800 truncate max-w-xs">{ticket.issue}</div>
                        {/* The ticket's ID. */}
                        <div className="text-xs text-slate-500">#{ticket.id}</div>
                    </div>
                </div>
            </td>
            {/* Table cell for the client's name. Shows '...' while loading. */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{client ? client.name : '...'}</td>
            {/* Table cell for the priority, displayed using the Badge component. */}
            <td className="px-6 py-4 whitespace-nowrap text-sm"><Badge type={ticket.priority} /></td>
            {/* Table cell for the status, displayed using the Badge component. */}
            <td className="px-6 py-4 whitespace-nowrap text-sm"><Badge type={ticket.status} /></td>
            {/* Table cell for the last update time, formatted by the timeAgo function. */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{timeAgo(lastUpdateDate)}</td>
        </tr>
    );
};

// Export the TicketListItem component as the default export.
export default TicketListItem;
