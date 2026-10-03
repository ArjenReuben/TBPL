// Import React library.
import React from 'react';
// Import enums for dropdown options.
import { Status, Priority } from '../types';
// Import the SearchIcon component.
import { SearchIcon } from './Icons';

// Define the interface for the props that the FilterBar component accepts.
interface FilterBarProps {
    // The current value of the text search input.
    searchTerm: string;
    // The current value of the status filter dropdown.
    statusFilter: string;
    // The current value of the priority filter dropdown.
    priorityFilter: string;
    // A callback function to update the search term state in the parent component.
    onSearchChange: (term: string) => void;
    // A callback function to update the status filter state in the parent component.
    onStatusChange: (status: string) => void;
    // A callback function to update the priority filter state in the parent component.
    onPriorityChange: (priority: string) => void;
}

/**
 * A reusable UI component for filtering the ticket list.
 * Includes a search bar and dropdowns for status and priority.
 * @param {FilterBarProps} props - The properties passed to the component.
 * @returns {React.ReactElement} The rendered filter bar.
 */
const FilterBar: React.FC<FilterBarProps> = ({ searchTerm, statusFilter, priorityFilter, onSearchChange, onStatusChange, onPriorityChange }) => {
    // The JSX for the filter bar.
    return (
        // Main container with styling.
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 flex flex-col lg:flex-row items-center gap-4">
            {/* The search input section. */}
            <div className="w-full lg:w-1/3 relative">
                <label htmlFor="search-filter" className="sr-only">Search tickets</label>
                {/* A decorative search icon positioned inside the input field. */}
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="h-5 w-5 text-slate-400" />
                </div>
                {/* The text input for search. */}
                <input
                    type="text"
                    id="search-filter"
                    value={searchTerm}
                    // Call the parent's handler on every change.
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="form-input w-full pl-10"
                    placeholder="Search by ID, issue, client..."
                />
            </div>
            
            {/* The dropdown filter section. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-2/3">
                 {/* Status filter dropdown. */}
                 <div>
                    <label htmlFor="status-filter" className="sr-only">Filter by status</label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        // Call the parent's handler on change.
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="form-select w-full"
                    >
                        {/* Default option. */}
                        <option value="All">All Statuses</option>
                        {/* Map over the Status enum to generate options dynamically. */}
                        {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 {/* Priority filter dropdown. */}
                 <div>
                    <label htmlFor="priority-filter" className="sr-only">Filter by priority</label>
                    <select
                        id="priority-filter"
                        value={priorityFilter}
                        // Call the parent's handler on change.
                        onChange={(e) => onPriorityChange(e.target.value)}
                        className="form-select w-full"
                    >
                        {/* Default option. */}
                        <option value="All">All Priorities</option>
                        {/* Map over the Priority enum to generate options dynamically. */}
                        {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
            </div>
             {/* Inline style block for custom form styles (select arrows, focus rings). */}
             <style dangerouslySetInnerHTML={{ __html: `
                .form-select, .form-input {
                    display: block;
                    width: 100%;
                    border-radius: 0.5rem;
                    border: 1px solid #cbd5e1;
                    padding: 0.5rem 0.75rem;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                }
                 .form-select {
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
                    background-position: right 0.5rem center;
                    background-repeat: no-repeat;
                    background-size: 1.5em 1.5em;
                    padding-right: 2.5rem;
                }
                .form-select:focus, .form-input:focus {
                    outline: none;
                    border-color: #4338ca;
                    box-shadow: 0 0 0 3px rgb(67 56 202 / 0.2);
                }
            `}}/>
        </div>
    );
};

// Export the component.
export default FilterBar;
