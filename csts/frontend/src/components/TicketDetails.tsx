// Import React library and hooks.
import React, { useState, useEffect, useCallback, useRef } from 'react';
// Import type definitions.
import type { Ticket, User } from '../types';
import { Status, UserRole } from '../types';
// Import the useAuth hook to get the current user.
import { useAuth } from '../hooks/useAuth';
// Import API functions.
import { addTicketUpdate, getUserById } from '../services/api';
// Import reusable components.
import Badge from './Badge';
import Spinner from './Spinner';
import { ArrowLeftIcon, SendIcon, CheckCircleIcon, XCircleIcon } from './Icons';

/**
 * A helper function to format a date string into a more readable format.
 * @param {string} dateString - The ISO date string.
 * @returns {string} The formatted date.
 */
const formatDate = (dateString: string) => {
    if (!dateString) return '...';
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Define a new unified type for items in the conversation list to resolve type errors.
interface ConversationItem {
    id: string | number;
    authorId: number;
    date: string;
    note: string;
    isDescription: boolean;
}

// Define the interface for the props that the TicketDetails component accepts.
interface TicketDetailsProps {
    // The ticket object to display.
    ticket: Ticket;
    // A function to handle returning to the ticket list view.
    onBack: () => void;
    // A function to call when the ticket is updated, passing the updated ticket object back to the parent.
    onTicketUpdate: (updatedTicket: Ticket) => void;
}

/**
 * A component to display the detailed view of a single ticket, including its conversation history
 * and forms for adding updates.
 * @param {TicketDetailsProps} props - The properties passed to the component.
 * @returns {React.ReactElement} The rendered ticket details view.
 */
const TicketDetails: React.FC<TicketDetailsProps> = ({ ticket, onBack, onTicketUpdate }) => {
    // Get the current user from the authentication context.
    const { user } = useAuth();
    // State for the new note/reply text area.
    const [note, setNote] = useState('');
    // State for the status dropdown (for staff).
    const [newStatus, setNewStatus] = useState<Status>(ticket.status);
    // State to track if a form is currently being submitted.
    const [isSubmitting, setIsSubmitting] = useState(false);
    // State to store author user objects, keyed by user ID, to avoid re-fetching.
    const [authors, setAuthors] = useState<Record<number, User>>({});
    // A ref to the scrollable conversation container for auto-scrolling.
    const conversationEndRef = useRef<HTMLDivElement>(null);

    // useEffect hook to fetch user details for the client, assignee, and any authors of updates.
    useEffect(() => {
        const fetchAuthors = async () => {
            if (!ticket) return;

            // Create a set of unique author IDs to fetch.
            const authorIds = new Set<number>([ticket.clientId]);
            if(ticket.assignedStaffId) authorIds.add(ticket.assignedStaffId);
            ticket.updates.forEach(update => authorIds.add(update.authorId));

            const newAuthors: Record<number, User> = {};
            // Loop through the IDs and fetch user data if it's not already in the `authors` state.
            for (const id of authorIds) {
                // Ensure ID is a valid number before fetching.
                if (id && !authors[id]) { 
                    const authorData = await getUserById(id);
                    if (authorData) {
                        newAuthors[id] = authorData;
                    }
                }
            }
            // If new authors were fetched, add them to the state.
            if (Object.keys(newAuthors).length > 0) {
                setAuthors(prev => ({ ...prev, ...newAuthors }));
            }
        };

        fetchAuthors();
    }, [ticket, authors]);
    
    // useEffect to automatically mark a ticket as read when a client views it.
    useEffect(() => {
        if (user?.role === UserRole.Client && ticket.clientHasUnreadUpdate) {
            const markAsRead = async () => {
                try {
                    // Call the API to update the flag in the database.
                    const updatedTicket = await addTicketUpdate(ticket.id, {
                        note: '',
                        authorId: user.id,
                        clientHasUnreadUpdate: false,
                    });
                    // Notify the parent component of the update.
                    onTicketUpdate(updatedTicket);
                } catch (error) {
                    console.error("Failed to mark ticket as read:", error);
                }
            };
            markAsRead();
        }
    }, [ticket, user, onTicketUpdate]);
    
    // useEffect to auto-scroll to the latest message when the conversation updates.
    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ticket.updates]);

    // useCallback to memoize the handler for submitting a new note or status change.
    const handleSubmit = useCallback(async () => {
        if (!user || (!note.trim() && newStatus === ticket.status)) {
            return;
        }

        setIsSubmitting(true);
        try {
            const updateData: { note: string; authorId: number; newStatus?: Status; clientHasUnreadUpdate?: boolean } = {
                note: note.trim(),
                authorId: user.id,
            };

            // Only staff can change the status.
            if (user.role === UserRole.Staff && newStatus !== ticket.status) {
                updateData.newStatus = newStatus;
            }
            
            // If a staff member posts an update, mark it as unread for the client.
            if (user.role === UserRole.Staff) {
                updateData.clientHasUnreadUpdate = true;
            }

            const updatedTicket = await addTicketUpdate(ticket.id, updateData);
            onTicketUpdate(updatedTicket);
            setNote('');
        } catch (error) {
            console.error("Failed to add update:", error);
            alert('Failed to add update. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [note, newStatus, ticket, user, onTicketUpdate]);
    
    // useCallback to memoize the handler for client feedback on a resolved ticket.
    const handleResolutionFeedback = useCallback(async (isResolved: boolean) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const updatedTicket = await addTicketUpdate(ticket.id, {
                note: `Client confirmed resolution: ${isResolved ? 'Yes' : 'No'}.`,
                authorId: user.id,
                isResolvedByClient: isResolved,
                // If client says it's not resolved, re-open the ticket to 'In Progress'.
                newStatus: !isResolved ? Status.InProgress : undefined,
                // Notify staff if the ticket is re-opened.
                clientHasUnreadUpdate: !isResolved 
            });
            onTicketUpdate(updatedTicket);
        } catch(error) {
            console.error("Failed to submit feedback:", error);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [ticket.id, user, onTicketUpdate]);

    const client = authors[ticket.clientId];
    const assignedStaff = ticket.assignedStaffId ? authors[ticket.assignedStaffId] : null;
    
    // Map the description and updates to the new unified `ConversationItem` type to fix TS errors.
    const allUpdates: ConversationItem[] = [
        // The first item is the ticket's original description
        {
            id: 'desc', // Use a unique string ID
            authorId: ticket.clientId,
            date: ticket.createdDate,
            note: ticket.description,
            isDescription: true, // Custom flag
        },
        // Map the rest of the updates, adding the `isDescription` flag
        ...ticket.updates.map(update => ({
            ...update,
            isDescription: false, // Explicitly add the flag
        }))
    ];

    // Determine if the ticket is "locked" (i.e., closed and not being viewed by an admin).
    const isLocked = ticket.status === Status.Closed;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/80 flex flex-col max-h-[calc(100vh-10rem)]">
            {/* Header */}
            <header className="p-5 border-b border-slate-200 flex-shrink-0">
                 <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-primary mb-3 transition-colors">
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to List
                </button>
                <h2 className="text-xl font-bold text-slate-800 break-words">{ticket.issue}</h2>
            </header>

            {/* Main Content Grid */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Conversation/Updates (Main Column) */}
                <main className="flex-1 flex flex-col p-6 overflow-y-auto">
                    <div className="space-y-6 flex-1">
                        {allUpdates.map((update) => {
                             const author = authors[update.authorId];
                             const isClientAuthor = author?.role === UserRole.Client;
                             const messageAlignment = isClientAuthor ? 'justify-end' : 'justify-start';
                             const messageBubbleColor = isClientAuthor ? 'bg-indigo-50 text-slate-800' : 'bg-white border border-slate-200 text-slate-700';
                             
                             return (
                                 <div key={update.id} className={`flex gap-3 ${messageAlignment}`}>
                                     {!isClientAuthor && (
                                         <div className="h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold bg-brand-primary mt-1">
                                            {author?.name.charAt(0) ?? '?'}
                                         </div>
                                     )}
                                     <div className="max-w-xl">
                                         <div className={`p-3 rounded-lg ${messageBubbleColor}`}>
                                            <div className="flex justify-between items-baseline mb-1">
                                                <p className="font-semibold text-sm">{author?.name ?? '...'}</p>
                                                <p className="text-xs text-slate-500">{formatDate(update.date)}</p>
                                            </div>
                                            <p className={`text-sm whitespace-pre-wrap ${update.isDescription ? 'font-semibold' : ''}`}>{update.note}</p>
                                         </div>
                                     </div>
                                     {isClientAuthor && (
                                         <div className="h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold bg-slate-500 mt-1">
                                            {author?.name.charAt(0) ?? '?'}
                                         </div>
                                     )}
                                 </div>
                             )
                        })}
                        {/* Dummy div to ensure auto-scrolling works correctly. */}
                        <div ref={conversationEndRef} />
                    </div>
                    {/* Action Footer (Message Input, etc.) */}
                    <footer className="pt-6 mt-auto">
                         {/* Client Resolution Feedback */}
                        {user?.role === UserRole.Client && ticket.status === Status.Resolved && ticket.isResolvedByClient === null && (
                            <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                                <h4 className="font-bold text-brand-primary">Is this issue resolved?</h4>
                                <p className="text-sm text-slate-600 mb-3">Your feedback helps us close this ticket.</p>
                                <div className="flex justify-center gap-3">
                                    <button onClick={() => handleResolutionFeedback(true)} disabled={isSubmitting} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                                        <CheckCircleIcon className="h-5 w-5" />
                                        Yes, it's resolved
                                    </button>
                                     <button onClick={() => handleResolutionFeedback(false)} disabled={isSubmitting} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50">
                                        <XCircleIcon className="h-5 w-5" />
                                        No, I still need help
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Reply Box - shown if ticket is not locked */}
                        {!isLocked && (user?.role === UserRole.Client || user?.role === UserRole.Staff) && (
                            <div className="relative">
                                <textarea
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    rows={3}
                                    className="form-textarea pr-20"
                                    placeholder="Type your reply..."
                                />
                                 <button onClick={handleSubmit} disabled={isSubmitting || !note.trim()} className="absolute bottom-2 right-2 inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg shadow-sm hover:bg-opacity-90 disabled:opacity-50">
                                    {isSubmitting ? <Spinner small /> : <SendIcon className="h-5 w-5" />}
                                    <span className="hidden sm:inline">{isSubmitting ? 'Sending...' : 'Send'}</span>
                                 </button>
                            </div>
                        )}

                        {isLocked && (
                             <p className="text-center text-sm text-slate-500 font-medium bg-slate-100 p-4 rounded-lg">This ticket is closed and cannot be updated.</p>
                        )}

                        {user?.role === UserRole.Admin && (
                             <p className="text-center text-sm text-slate-500 font-medium bg-slate-100 p-4 rounded-lg italic">Administrators can view tickets but do not participate in conversations.</p>
                        )}
                    </footer>
                </main>
                
                {/* Details Sidebar */}
                <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 p-6 flex-shrink-0 bg-slate-50/50 overflow-y-auto">
                     <div className="space-y-6">
                         <h3 className="text-lg font-semibold text-slate-700">Ticket Details</h3>
                         <div className="text-sm space-y-4">
                            <div>
                                <p className="font-semibold text-slate-600">Status</p>
                                <Badge type={ticket.status} />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-600">Priority</p>
                                <Badge type={ticket.priority} />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-600">Client</p>
                                <p className="text-slate-800">{client?.name ?? 'Loading...'}</p>
                                <p className="text-slate-500">{client?.company}</p>
                            </div>
                             <div>
                                <p className="font-semibold text-slate-600">Assigned To</p>
                                <p className="text-slate-800">{assignedStaff?.name ?? 'Not Assigned'}</p>
                            </div>
                         </div>
                         
                         {/* Status Change for Staff */}
                         {user?.role === UserRole.Staff && !isLocked && (
                             <div className="border-t border-slate-200 pt-6">
                                <label htmlFor="status-change" className="block text-sm font-medium text-slate-700 mb-1">Change Status</label>
                                <select
                                     id="status-change"
                                     value={newStatus}
                                     onChange={e => setNewStatus(e.target.value as Status)}
                                     className="form-select"
                                >
                                     {/* Staff can only set these statuses. "Closed" is automated. */}
                                     <option value={Status.Open}>Open</option>
                                     <option value={Status.InProgress}>In Progress</option>
                                     <option value={Status.Resolved}>Resolved</option>
                                </select>
                                <button onClick={handleSubmit} disabled={isSubmitting || newStatus === ticket.status} className="w-full mt-3 inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg shadow-sm hover:bg-opacity-90 disabled:opacity-50">
                                    {isSubmitting ? 'Saving...' : 'Update Status'}
                                </button>
                             </div>
                         )}

                     </div>
                </aside>
            </div>
            {/* Inline style block for custom form styles to be shared across components. */}
            <style dangerouslySetInnerHTML={{ __html: `
                .form-input, .form-textarea, .form-select {
                    display: block;
                    width: 100%;
                    border-radius: 0.5rem;
                    border: 1px solid #cbd5e1;
                    padding: 0.75rem 1rem;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                    background-color: #fff;
                }
                .form-input:focus, .form-textarea:focus, .form-select:focus {
                    outline: none;
                    border-color: #4338ca;
                    box-shadow: 0 0 0 3px rgb(67 56 202 / 0.2);
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
            `}}/>
        </div>
    );
};

export default TicketDetails;