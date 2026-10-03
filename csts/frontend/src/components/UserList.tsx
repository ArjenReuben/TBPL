
// Import the React library.
import React from 'react';
// Import type definitions for User and UserRole.
import type { User } from '../types';
import { UserRole } from '../types';

// Define the interface for the props that the UserList component accepts.
interface UserListProps {
    // An array of user objects to display.
    users: User[];
    // A title for the list (e.g., "All Clients").
    title: string;
}

/**
 * A reusable component to display a list of users (clients or staff) in a table.
 * @param {UserListProps} props - The properties passed to the component.
 * @returns {React.ReactElement} The rendered user list table.
 */
const UserList: React.FC<UserListProps> = ({ users, title: _title }) => {
    // Check the role of the first user in the list to determine if this is a list of clients.
    // This is used to dynamically change the column header from "Company" to "Role".
    const isClientList = users[0]?.role === UserRole.Client;

    // The JSX for the component.
    return (
        // A container to allow horizontal scrolling on small screens.
        <div className="overflow-x-auto">
            {/* The main table element. */}
            <table className="min-w-full divide-y divide-slate-200">
                {/* The table header. */}
                <thead className="bg-slate-50">
                    {/* The header row. */}
                    <tr>
                        {/* Header cell for the user's name. */}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                        {/* Header cell that is dynamically labeled "Company" or "Role". */}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{isClientList ? 'Company' : 'Role'}</th>
                        {/* Header cell for the user's email. */}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Email</th>
                    </tr>
                </thead>
                {/* The table body. */}
                <tbody className="bg-white divide-y divide-slate-200">
                    {/* Map over the `users` array to create a table row for each user. */}
                    {users.map(user => (
                        // Each row needs a unique key.
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors duration-150">
                            {/* Table cell for the user's name. */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{user.name}</td>
                            {/* Table cell for the user's company (or role, as `company` field is used for both). */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.company}</td>
                            {/* Table cell for the user's email. */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Export the UserList component.
export default UserList;
