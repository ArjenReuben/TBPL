// Import the React library.
import React from 'react';

// Define the interface for the props that the StatCard component accepts.
interface StatCardProps {
    // The title of the statistic (e.g., "Total Tickets").
    title: string;
    // The value of the statistic, which can be a number or a string.
    value: number | string;
    // A React node for the icon to be displayed, typically an SVG component.
    icon: React.ReactNode;
    // A string of CSS classes for the background color of the icon container.
    colorClass: string;
}

/**
 * A reusable card component for displaying a single statistic on the dashboard.
 * @param {StatCardProps} props - The properties passed to the component.
 * @returns {React.ReactElement} The rendered statistic card.
 */
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass }) => {
    // Return the JSX structure of the stat card.
    return (
        // The main container for the card with styling for background, padding, shadow, etc.
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/80 flex items-center gap-5">
            {/* A styled container for the icon. */}
            <div className={`flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg ${colorClass}`}>
                {/* The icon node is rendered here. */}
                {icon}
            </div>
            {/* A container for the text content (title and value). */}
            <div>
                {/* The title of the statistic. */}
                <p className="text-sm font-medium text-slate-500">{title}</p>
                {/* The value of the statistic, displayed in a larger, bold font. */}
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
};

// Export the StatCard component as the default export.
export default StatCard;
