// Import the React library.
import React from 'react';
// Import the Priority and Status enums from the types file.
import { Priority, Status } from '../types';

// Define the interface for the props that the Badge component accepts.
interface BadgeProps {
    // The type of the badge, which can be either a Priority or a Status.
    type: Priority | Status;
}

/**
 * A reusable component for displaying a colored badge for ticket priority and status.
 * @param {BadgeProps} props - The properties passed to the component.
 * @returns {React.ReactElement} The rendered badge.
 */
const Badge: React.FC<BadgeProps> = ({ type }) => {
    // An object that maps each enum value (Priority or Status) to a set of Tailwind CSS classes.
    const styles: { [key: string]: string } = {
        // Style for Low priority.
        [Priority.Low]: 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-200',
        // Style for Medium priority.
        [Priority.Medium]: 'bg-yellow-100 text-yellow-700 ring-1 ring-inset ring-yellow-200',
        // Style for High priority.
        [Priority.High]: 'bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-200',
        // Style for Urgent priority.
        [Priority.Urgent]: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200',
        // Style for Open status.
        [Status.Open]: 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200',
        // Style for In Progress status.
        [Status.InProgress]: 'bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-200',
        // Style for Resolved status.
        [Status.Resolved]: 'bg-teal-100 text-teal-700 ring-1 ring-inset ring-teal-200',
        // Style for Closed status.
        [Status.Closed]: 'bg-slate-200 text-slate-700 ring-1 ring-inset ring-slate-300',
    };

    // Get the corresponding style string from the `styles` object based on the `type` prop.
    // If no match is found, use a default gray style.
    const style = styles[type] || 'bg-gray-100 text-gray-800';

    // Return the JSX for the badge.
    return (
        // A `span` element is used for the inline badge.
        // It combines common styling with the dynamically selected style string.
        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${style}`}>
            {/* The text content of the badge is the value of the `type` prop itself. */}
            {type}
        </span>
    );
};

// Export the Badge component as the default export of this file.
export default Badge;
