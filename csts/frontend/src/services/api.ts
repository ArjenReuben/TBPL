
// Import type definitions for Ticket and User.
import type { Ticket, User } from '../types';
// Import the Status enum.
import { Status } from '../types';

// Define the base URL for the backend API server.
// Uses VITE_API_URL when set (e.g. in production), falling back to localhost for local development.
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

/**
 * A helper function to handle API responses, check for errors, and parse JSON.
 * @param {Response} response - The raw response object from a fetch call.
 * @returns {Promise<any>} A promise that resolves with the parsed JSON data.
 */
const handleResponse = async (response: Response) => {
    // Check if the response status code is not in the 200-299 range (i.e., not successful).
    if (!response.ok) {
        // If there's an error, try to parse the error message from the response body.
        const error = await response.json();
        // Throw a new error with the message from the server or a generic message.
        throw new Error(error.message || 'An API error occurred');
    }
    // If the response is successful, parse and return the JSON body.
    return response.json();
};

// Fetches all tickets from the backend.
export const getTickets = async (): Promise<Ticket[]> => {
    // Make a GET request to the /tickets endpoint.
    const response = await fetch(`${API_URL}/tickets`);
    // Process the response using the helper function.
    return handleResponse(response);
};

// Fetches all tickets for a specific client from the backend.
export const getTicketsByClientId = async (clientId: number): Promise<Ticket[]> => {
    // Make a GET request to the /tickets/client/:clientId endpoint.
    const response = await fetch(`${API_URL}/tickets/client/${clientId}`);
    // Process the response.
    return handleResponse(response);
};

// Fetches a single user by their ID from the backend.
export const getUserById = async (id: number): Promise<User | undefined> => {
    // Use a try-catch block to handle network errors or cases where the user is not found.
    try {
        // Make a GET request to the /users/:id endpoint.
        const response = await fetch(`${API_URL}/users/${id}`);
        // If the server returns a 404 status, it means the user was not found.
        if(response.status === 404) return undefined;
        // Otherwise, process the successful response.
        return await handleResponse(response);
    } catch (e) {
        // Log any errors to the console.
        console.error(e);
        // Return undefined if an error occurs.
        return undefined;
    }
};

// Fetches all users from the backend.
export const getUsers = async (): Promise<User[]> => {
    // Make a GET request to the /users endpoint.
    const response = await fetch(`${API_URL}/users`);
    // Process the response.
    return handleResponse(response);
};

// Creates a new user in the backend.
export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    // Make a POST request to the /users endpoint.
    const response = await fetch(`${API_URL}/users`, {
        // Specify the method as POST.
        method: 'POST',
        // Set headers to indicate the body is JSON.
        headers: { 'Content-Type': 'application/json' },
        // Stringify the user data to send as the request body.
        body: JSON.stringify(userData),
    });
    // Process the response.
    return handleResponse(response);
};

// Creates a new ticket in the backend.
export const createTicket = async (newTicketData: Omit<Ticket, 'id' | 'createdDate' | 'updates' | 'clientHasUnreadUpdate' | 'isResolvedByClient'>): Promise<Ticket> => {
    // Make a POST request to the /tickets endpoint.
    const response = await fetch(`${API_URL}/tickets`, {
        // Specify the method as POST.
        method: 'POST',
        // Set headers for JSON content.
        headers: { 'Content-Type': 'application/json' },
        // Stringify the ticket data for the request body.
        body: JSON.stringify(newTicketData),
    });
    // Process the response.
    return handleResponse(response);
};

// Adds an update to a ticket or modifies its status fields in the backend.
export const addTicketUpdate = async (ticketId: number, updateData: { note: string; authorId: number; newStatus?: Status; clientHasUnreadUpdate?: boolean; isResolvedByClient?: boolean | null }): Promise<Ticket> => {
    // Make a POST request to the /tickets/:id/updates endpoint.
    const response = await fetch(`${API_URL}/tickets/${ticketId}/updates`, {
        // Specify the method as POST.
        method: 'POST',
        // Set headers for JSON content.
        headers: { 'Content-Type': 'application/json' },
        // Stringify the update data for the request body.
        body: JSON.stringify(updateData),
    });
    // Process the response, which should return the fully updated ticket object.
    return handleResponse(response);
};
