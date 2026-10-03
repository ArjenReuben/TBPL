// Import the React library.
import React from 'react';

// Define the interface for the props that the Spinner component accepts.
interface SpinnerProps {
    // An optional boolean prop to render a smaller version of the spinner.
    small?: boolean;
}

/**
 * A simple SVG loading spinner component.
 * @param {SpinnerProps} props - The properties passed to the component.
 * @returns {React.ReactElement} The rendered SVG spinner.
 */
const Spinner: React.FC<SpinnerProps> = ({ small = false }) => {
    // Determine the size classes based on the `small` prop.
    const sizeClasses = small ? 'h-5 w-5' : 'h-8 w-8';
    // Define the color classes for the spinner.
    const colorClasses = 'text-blue-600';

    // Return the SVG element for the spinner.
    return (
        <svg
            // Apply CSS classes for animation, size, and color.
            className={`animate-spin ${sizeClasses} ${colorClasses}`}
            // Standard SVG attributes.
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            // Accessibility attribute to label the element for screen readers.
            aria-label="Loading"
        >
            {/* The background circle of the spinner, with reduced opacity. */}
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            ></circle>
            {/* The moving part of the spinner, a path with full opacity. */}
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
    );
};

// Export the Spinner component as the default export.
export default Spinner;
