
// Defines an enumeration for ticket priority levels.
export enum Priority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Urgent = 'Urgent',
}

// Defines an enumeration for ticket status types.
export enum Status {
    Open = 'Open',
    InProgress = 'In Progress',
    Resolved = 'Resolved',
    Closed = 'Closed',
}

// Defines an enumeration for user roles within the system.
export enum UserRole {
    Client = 'Client',
    Staff = 'Staff',
    Admin = 'Admin',
}

// Defines a unified structure for a User object.
export interface User {
    // A unique numerical identifier for the user.
    id: number;
    // The user's full name.
    name: string;
    // The user's email address, used for login.
    email: string;
    // The role of the user in the system.
    role: UserRole;
    // A flexible field: for clients, this is their company name. For staff, it's their job title/role.
    company: string;
}

// Extends the base User interface for a Client, ensuring the role is always Client.
export interface Client extends User {
    role: UserRole.Client;
}

// Extends the base User interface for a Staff member, ensuring the role is always Staff.
export interface Staff extends User {
    role: UserRole.Staff;
}

// Defines the structure of a TicketUpdate object, representing a comment or action on a ticket.
export interface TicketUpdate {
    // A unique numerical identifier for the update.
    id: number;
    // The ID of the ticket this update belongs to.
    ticketId: number;
    // The ID of the user (client or staff) who authored this update.
    authorId: number;
    // The content of the update note or comment.
    note: string;
    // The date and time when the update was made, in ISO string format.
    date: string;
}

// Defines the structure of a Ticket object.
export interface Ticket {
    // A unique numerical identifier for the ticket.
    id: number;
    // The ID of the client who created the ticket.
    clientId: number;
    // A short summary of the ticket's issue.
    issue: string;
    // A detailed description of the ticket's issue.
    description: string;
    // The date and time when the ticket was created, in ISO string format.
    createdDate: string;
    // The priority level of the ticket.
    priority: Priority;
    // The current status of the ticket.
    status: Status;
    // The ID of the staff member assigned to the ticket.
    assignedStaffId: number;
    // An array of updates associated with the ticket.
    updates: TicketUpdate[];
    // A boolean flag to indicate if there's a new update for the client to see.
    clientHasUnreadUpdate: boolean;
    // A flag for client feedback: null (pending), true (yes, it's resolved), false (no, I still need help).
    isResolvedByClient: boolean | null;
}
