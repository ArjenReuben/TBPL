
// Import React library and hooks.
import React, { useState, useCallback } from 'react';
// Import the API function for creating a user.
import { createUser } from '../services/api';
// Import the UserRole enum.
import { UserRole } from '../types';
// Import reusable components.
import Spinner from './Spinner';
import { CloseIcon } from './Icons';

// Define the interface for the props that the modal accepts.
interface CreateUserModalProps {
    // Function to close the modal.
    onClose: () => void;
    // Function to call after a user is successfully created.
    onUserCreated: () => void;
}

/**
 * A modal form for administrators to create new users (either clients or staff).
 * @param {CreateUserModalProps} props - The properties passed to the component.
 * @returns {React.ReactElement} The rendered modal.
 */
const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onUserCreated }) => {
    // State for the new user's name.
    const [name, setName] = useState('');
    // State for the new user's email.
    const [email, setEmail] = useState('');
    // State for the company name (if client) or role title (if staff).
    const [companyOrRole, setCompanyOrRole] = useState('');
    // State for the selected user role, defaulting to Client.
    const [role, setRole] = useState<UserRole.Client | UserRole.Staff>(UserRole.Client);
    // State for the user's password, with a default value.
    const [password, setPassword] = useState('password123');
    
    // State to track if the form is currently submitting.
    const [isSubmitting, setIsSubmitting] = useState(false);

    // useCallback to memoize the form submission handler.
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        // Prevent the default form submission (page reload).
        e.preventDefault();
        // Basic validation.
        if (!name || !email || !companyOrRole) {
            alert('Please fill out all fields.');
            return;
        }
        // Set submitting state to true.
        setIsSubmitting(true);
        try {
            // Call the API to create the new user.
            await createUser({
                name,
                email,
                // The `company` field in the API/database is used for both company name and role title.
                company: companyOrRole,
                role,
            });
            // Notify the parent component of success.
            onUserCreated();
        } catch (error) {
            // Handle errors.
            console.error("Failed to create user", error);
            alert("Failed to create user. Please try again.");
        } finally {
            // Reset submitting state.
            setIsSubmitting(false);
        }
    }, [name, email, companyOrRole, role, onUserCreated]); // Dependencies for the callback.

    // The JSX for the modal.
    return (
        // The modal overlay.
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300" aria-modal="true" role="dialog">
            {/* The modal content container. */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-up">
                {/* Modal header. */}
                <div className="flex justify-between items-center p-5 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">Create New User</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100 transition-colors">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
                {/* The form element. */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                    {/* Radio buttons to select user type (Client or Staff). */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">User Type</label>
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input type="radio" value={UserRole.Client} checked={role === UserRole.Client} onChange={() => setRole(UserRole.Client)} className="h-4 w-4 text-brand-primary border-slate-300 focus:ring-brand-primary" />
                                <span className="ml-2 text-sm text-slate-800">Client</span>
                            </label>
                             <label className="flex items-center">
                                <input type="radio" value={UserRole.Staff} checked={role === UserRole.Staff} onChange={() => setRole(UserRole.Staff)} className="h-4 w-4 text-brand-primary border-slate-300 focus:ring-brand-primary" />
                                <span className="ml-2 text-sm text-slate-800">Staff</span>
                            </label>
                        </div>
                    </div>

                    {/* Full Name input field. */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="form-input" required />
                    </div>
                     {/* Email Address input field. */}
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" required />
                    </div>
                     {/* Company or Role input field (label changes based on selected role). */}
                     <div>
                        <label htmlFor="companyOrRole" className="block text-sm font-medium text-slate-700 mb-1">{role === UserRole.Client ? 'Company Name' : 'Job Title / Role'}</label>
                        <input type="text" id="companyOrRole" value={companyOrRole} onChange={e => setCompanyOrRole(e.target.value)} className="form-input" required />
                    </div>
                     {/* Password input field. */}
                     <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input bg-slate-100" required />
                        <p className="text-xs text-slate-500 mt-1">Default password is `password123`. User can change it later.</p>
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
                        {isSubmitting ? 'Creating...' : 'Create User'}
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
export default CreateUserModal;
