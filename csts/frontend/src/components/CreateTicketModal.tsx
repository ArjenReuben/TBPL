
// Import React library and hooks.
import React, { useState, useEffect, useCallback } from 'react';
// Import API functions.
// FIX: `getStaff` is not an exported function from the API service. The component already fetches all users and filters them by role.
import { createTicket, getUsers } from '../services/api';
// Import type definitions.
import type { User } from '../types';
// Import enums.
import { Priority, Status, UserRole } from '../types';
// Import the useAuth hook to get the current user.
import { useAuth } from '../hooks/useAuth';
// Import reusable components.
import Spinner from './Spinner';
import { CloseIcon } from './Icons';

// Define the interface for the props that the modal accepts.
interface CreateTicketModalProps {
    // Function to close the modal.
    onClose: () => void;
    // Function to call after a ticket is created.
    onTicketCreated: () => void;
}

/**
 * A modal form for creating a new support ticket, with role-aware fields.
 * For example, clients don't need to select their name, but admins do.
 * @param {CreateTicketModalProps} props - The properties passed to the component.
 * @returns {React.ReactElement} The rendered modal.
 */
const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ onClose, onTicketCreated }) => {
    // Get the current user from the authentication context.
    const { user } = useAuth();
    // State for the ticket's subject field.
    const [issue, setIssue] = useState('');
    // State for the ticket's description field.
    const [description, setDescription] = useState('');
    // State for the client ID. If the user is a client, it defaults to their own ID.
    const [clientId, setClientId] = useState(user?.role === UserRole.Client ? String(user.id) : '');
    // State for the priority dropdown.
    const [priority, setPriority] = useState<Priority>(Priority.Medium);
    // State for the assigned staff member dropdown.
    const [assignedStaffId, setAssignedStaffId] = useState('');
    
    // State to hold the list of all clients for the admin's dropdown.
    const [clients, setClients] = useState<User[]>([]);
    // State to hold the list of all staff members for the assignee dropdown.
    const [staff, setStaff] = useState<User[]>([]);
    
    // State to track if the form is currently being submitted.
    const [isSubmitting, setIsSubmitting] = useState(false);

    // useEffect hook to fetch user data (clients and staff) for the dropdowns.
    useEffect(() => {
        // Define an async function to perform the fetching.
        const fetchData = async () => {
            // Fetch all users from the API.
            const allUsers = await getUsers();
            // Filter the users to get a list of clients.
            const clientsData = allUsers.filter(u => u.role === UserRole.Client);
            // Filter the users to get a list of staff.
            const staffData = allUsers.filter(u => u.role === UserRole.Staff);
            
            // Set the state for clients and staff lists.
            setClients(clientsData);
            setStaff(staffData);
            
            // If the current user is an admin and there are clients, set the default selection to the first client.
            if (user?.role === UserRole.Admin && clientsData.length > 0) {
                setClientId(String(clientsData[0].id));
            }

            // If there are staff members, set the default assignee to the first one.
            if (staffData.length > 0) {
                setAssignedStaffId(String(staffData[0].id));
            }
        };
        // Call the fetch function.
        fetchData();
    }, [user]); // Re-run the effect if the user object changes (though it shouldn't during the modal's lifecycle).

    // useCallback hook to memoize the form submission handler.
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        // Prevent default form submission behavior.
        e.preventDefault();
        // Basic validation.
        if (!issue || !description || !clientId || !assignedStaffId) {
            alert('Please fill out all fields.');
            return;
        }
        // Set submitting state to true.
        setIsSubmitting(true);
        try {
            // Call the API to create the ticket.
            await createTicket({
                issue,
                description,
                clientId: parseInt(clientId, 10),
                priority,
                status: Status.Open,
                assignedStaffId: parseInt(assignedStaffId, 10),
            });
            // Notify the parent component of success.
            onTicketCreated();
        } catch (error) {
            // Handle errors.
            console.error("Failed to create ticket", error);
            alert("Failed to create ticket. Please try again.");
        } finally {
            // Reset submitting state.
            setIsSubmitting(false);
        }
    }, [issue, description, clientId, priority, assignedStaffId, onTicketCreated]); // Dependencies for the callback.

    // The JSX for the modal.
    return (
        // The modal overlay.
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300" aria-modal="true" role="dialog">
            {/* The modal content container. */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-up">
                {/* Modal header. */}
                <div className="flex justify-between items-center p-5 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">Create New Ticket</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100 transition-colors">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
                {/* The form element. */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                    {/* Subject field. */}
                    <div>
                        <label htmlFor="issue" className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                        <input type="text" id="issue" value={issue} onChange={e => setIssue(e.target.value)} className="form-input" placeholder="e.g., Cannot login to portal" required />
                    </div>
                    {/* Description field. */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">How can we help?</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={5} className="form-textarea" placeholder="Please provide as much detail as possible..." required />
                    </div>
                    {/* Grid for client and priority fields. */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                             <label htmlFor="client" className="block text-sm font-medium text-slate-700 mb-1">Client</label>
                            {/* Role-aware client field: Clients see their name, Admins see a dropdown. */}
                            {user?.role === UserRole.Client ? (
                                <p className="form-input bg-slate-100">{user.name} - {user.company}</p>
                            ) : (
                                <select id="client" value={clientId} onChange={e => setClientId(e.target.value)} className="form-select" required>
                                    {clients.length === 0 && <option>Loading...</option>}
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} - {c.company}</option>)}
                                </select>
                            )}
                        </div>
                         {/* Priority dropdown. */}
                         <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                            <select id="priority" value={priority} onChange={e => setPriority(e.target.value as Priority)} className="form-select" required>
                                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    {/* Assignee dropdown. */}
                    <div>
                        <label htmlFor="assignee" className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
                        <select id="assignee" value={assignedStaffId} onChange={e => setAssignedStaffId(e.target.value)} className="form-select" required>
                            {staff.length === 0 && <option>Loading...</option>}
                            {staff.map(s => <option key={s.id} value={s.id}>{s.name} - {s.company}</option>)}
                        </select>
                    </div>
                </form>
                 {/* Modal footer with action buttons. */}
                 <div className="flex justify-end items-center p-5 border-t border-slate-200 bg-slate-50 rounded-b-xl mt-auto">
                    {/* Cancel button. */}
                    <button onClick={onClose} type="button" className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                        Cancel
                    </button>
                    {/* Submit button. */}
                    <button onClick={handleSubmit} type="submit" className="ml-3 inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-primary border border-transparent rounded-lg shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50" disabled={isSubmitting}>
                        {isSubmitting && <Spinner small />}
                        {isSubmitting ? 'Creating...' : 'Create Ticket'}
                    </button>
                </div>
            </div>
            {/* Inline style block for custom form styles and animations. */}
            <style dangerouslySetInnerHTML={{ __html: `
                .form-input, .form-textarea, .form-select {
                    display: block;
                    width: 100%;
                    border-radius: 0.5rem;
                    border: 1px solid #cbd5e1;
                    padding: 0.75rem 1rem;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                }
                .form-input:focus, .form-textarea:focus, .form-select:focus {
                    outline: none;
                    border-color: #4338ca;
                    box-shadow: 0 0 0 3px rgb(67 56 202 / 0.2);
                }
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px) scale(0.95); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}}/>
        </div>
    );
};

// Export the component.
export default CreateTicketModal;
