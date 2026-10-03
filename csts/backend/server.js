// Load environment variables from a .env file into process.env.
require('dotenv').config();
// Import the express library to create and manage the server.
const express = require('express');
// Import the cors library to enable Cross-Origin Resource Sharing.
const cors = require('cors');
// Import the mysql2 library with promise support for database interactions.
const mysql = require('mysql2/promise');

// Create an instance of an Express application.
const app = express();
// Define the port the server will listen on, from environment variables or defaulting to 3001.
const PORT = process.env.PORT || 3001;

// --- Middleware ---
// Enable CORS for all routes, allowing requests from different origins (e.g., the frontend).
app.use(cors());
// Enable the express.json() middleware to parse incoming JSON payloads in request bodies.
app.use(express.json());

// --- Database Connection Pool ---
// Create a connection pool to the MySQL database for efficient connection management.
const pool = mysql.createPool({
  // The database host, from environment variables.
  host: process.env.DB_HOST,
  // Database port, from environment variables. Defaults to MySQL's standard 3306
  // for local setups; hosted databases like Aiven use a custom port instead.
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  // The database user, from environment variables.
  user: process.env.DB_USER,
  // The database password, from environment variables.
  password: process.env.DB_PASSWORD,
  // The name of the database, from environment variables.
  database: process.env.DB_NAME,
  // Enable SSL when DB_SSL=true (required by hosts like Aiven); rejectUnauthorized is
  // left false since most free managed MySQL hosts use certs not in Node's default trust store.
  ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
  // Whether to wait for a connection to be available if all are in use.
  waitForConnections: true,
  // The maximum number of connections in the pool.
  connectionLimit: 10,
  // The maximum number of requests to queue if all connections are busy. 0 means no limit.
  queueLimit: 0
});

/**
 * A helper function to execute database queries and handle errors centrally.
 * @param {string} sql - The SQL query string.
 * @param {Array} params - The parameters to be safely inserted into the query.
 * @returns {Promise<any>} The results of the query.
 */
const query = async (sql, params) => {
    // Use a try-catch block to handle potential database errors.
    try {
        // Get a connection from the pool and execute the query.
        const [results] = await pool.execute(sql, params);
        // Return the query results.
        return results;
    } catch (error) {
        // Log the detailed error to the server console.
        console.error('DB Query Error:', error);
        // Throw a generic error to be caught by the route handler.
        throw new Error('Database error occurred.');
    }
};

// --- API Endpoints ---

// --- Auth ---
// Defines a POST route for user login.
app.post('/api/login', async (req, res) => {
    // Destructure email and password from the request body.
    const { email, password } = req.body;
    // Basic validation to ensure email and password are provided.
    if (!email || !password) {
        // If not, return a 400 Bad Request status.
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    // Use a try-catch block for async error handling.
    try {
        // Query the database for a user, aliasing column names to camelCase for frontend consistency.
        const users = await query('SELECT UserID as id, Name as name, Email as email, Role as role, Company as company FROM Users WHERE Email = ? AND Password = ?', [email, password]);
        // Check if any user was found.
        if (users.length > 0) {
            // Get the first user from the results.
            const user = users[0];
            // Send the user object back as a JSON response.
            res.json(user);
        } else {
            // If no user was found, send a 401 Unauthorized status.
            res.status(401).json({ message: 'Invalid credentials.' });
        }
    } catch (error) {
        // If a server error occurs, send a 500 Internal Server Error status.
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// Defines a POST route for admin login.
app.post('/api/admin-login', (req, res) => {
    // Destructure the password from the request body.
    const { password } = req.body;
    // Compare the provided password with the one stored in environment variables.
    if (password === process.env.ADMIN_PASSWORD) {
        // If it matches, send back a mock "Admin" user object using camelCase keys.
        res.json({
            id: 999, // A static ID for the admin session.
            name: 'Administrator',
            email: 'admin@system.local',
            role: 'Admin',
            company: 'System'
        });
    } else {
        // If passwords don't match, send a 401 Unauthorized status.
        res.status(401).json({ message: 'Invalid admin password.' });
    }
});


// --- Users ---
// Defines a GET route to fetch all users.
app.get('/api/users', async (req, res) => {
    try {
        // Query the database for all users, aliasing all columns to camelCase.
        const users = await query('SELECT UserID as id, Name as name, Email as email, Role as role, Company as company FROM Users');
        // Send the list of users as a JSON response.
        res.json(users);
    } catch (error) {
        // Handle server errors.
        res.status(500).json({ message: error.message });
    }
});

// Defines a GET route to fetch a single user by their ID.
app.get('/api/users/:id', async (req, res) => {
    try {
        // Query the database for a user with the specified ID, aliasing all columns to camelCase.
        const users = await query('SELECT UserID as id, Name as name, Email as email, Role as role, Company as company FROM Users WHERE UserID = ?', [req.params.id]);
        // Check if a user was found.
        if (users.length > 0) {
            // Send the found user object.
            res.json(users[0]);
        } else {
            // If not found, send a 404 Not Found status.
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        // Handle server errors.
        res.status(500).json({ message: error.message });
    }
});

// Defines a POST route to create a new user.
app.post('/api/users', async (req, res) => {
    // Destructure user data from the request body, providing a default password.
    const { name, email, company, role, password = 'password123' } = req.body;
    try {
        // Execute an INSERT query to add the new user to the database.
        const result = await query(
            'INSERT INTO Users (Name, Email, Company, Role, Password) VALUES (?, ?, ?, ?, ?)',
            [name, email, company, role, password]
        );
        // Create a new user object to send back, using camelCase.
        const newUser = { id: result.insertId, name, email, company, role };
        // Send a 201 Created status along with the new user object.
        res.status(201).json(newUser);
    } catch (error) {
        // Handle server errors.
        res.status(500).json({ message: error.message });
    }
});


// --- Tickets ---
// A helper function to construct the ticket SELECT query with all columns aliased to camelCase.
const ticketSelectQuery = `
    SELECT 
        TicketID as id, 
        ClientID as clientId, 
        Issue as issue, 
        Description as description, 
        CreatedDate as createdDate, 
        Priority as priority, 
        Status as status, 
        AssignedStaffID as assignedStaffId, 
        ClientHasUnreadUpdate as clientHasUnreadUpdate, 
        IsResolvedByClient as isResolvedByClient 
    FROM Tickets
`;

// A helper function to construct the ticket updates SELECT query with all columns aliased to camelCase.
const updatesSelectQuery = `
    SELECT 
        UpdateID as id, 
        TicketID as ticketId, 
        AuthorID as authorId, 
        Note as note, 
        Date as date 
    FROM Ticket_Updates
`;

// Defines a GET route to fetch all tickets.
app.get('/api/tickets', async (req, res) => {
    try {
        // Query the database for all tickets using the helper query.
        const tickets = await query(`${ticketSelectQuery} ORDER BY createdDate DESC`);
        // Loop through each ticket to fetch its associated updates.
        for (let ticket of tickets) {
            // Use the actual database column name `TicketID` in the WHERE clause.
            ticket.updates = await query(`${updatesSelectQuery} WHERE TicketID = ? ORDER BY date ASC`, [ticket.id]);
        }
        // Send the complete list of tickets with their updates.
        res.json(tickets);
    } catch (error) {
        // Handle server errors.
        res.status(500).json({ message: error.message });
    }
});

// Defines a GET route to fetch all tickets for a specific client.
app.get('/api/tickets/client/:clientId', async (req, res) => {
    try {
        // Use the actual database column name `ClientID` in the WHERE clause.
        const tickets = await query(`${ticketSelectQuery} WHERE ClientID = ? ORDER BY createdDate DESC`, [req.params.clientId]);
        // Loop through the fetched tickets to get their updates.
        for (let ticket of tickets) {
            // Use the actual database column name `TicketID` in the WHERE clause.
            ticket.updates = await query(`${updatesSelectQuery} WHERE TicketID = ? ORDER BY date ASC`, [ticket.id]);
        }
        // Send the client-specific tickets as a JSON response.
        res.json(tickets);
    } catch (error) {
        // Handle server errors.
        res.status(500).json({ message: error.message });
    }
});


// Defines a POST route to create a new ticket.
app.post('/api/tickets', async (req, res) => {
    // Destructure ticket data from the request body.
    const { issue, description, clientId, priority, status, assignedStaffId } = req.body;
    try {
        // Execute an INSERT query to add the new ticket to the database.
        const result = await query(
            'INSERT INTO Tickets (Issue, Description, ClientID, Priority, Status, AssignedStaffID) VALUES (?, ?, ?, ?, ?, ?)',
            [issue, description, clientId, priority, status, assignedStaffId]
        );
        // Fetch the newly created ticket to send it back in the response.
        // Use the actual database column name `TicketID` in the WHERE clause.
        const [newTicket] = await query(`${ticketSelectQuery} WHERE TicketID = ?`, [result.insertId]);
        // Initialize the updates array as empty.
        newTicket.updates = [];
        // Send a 201 Created status and the new ticket object.
        res.status(201).json(newTicket);
    } catch (error) {
        // Handle server errors.
        res.status(500).json({ message: error.message });
    }
});


// Defines a POST route to add an update to a ticket or modify its status.
app.post('/api/tickets/:id/updates', async (req, res) => {
    // Get the ticket ID from the route parameters.
    const ticketId = req.params.id;
    // Destructure update data from the request body.
    let { note, authorId, newStatus, clientHasUnreadUpdate, isResolvedByClient } = req.body;

    try {
        // If a note is provided, insert it into the Ticket_Updates table.
        if (note) {
            await query(
                'INSERT INTO Ticket_Updates (TicketID, AuthorID, Note) VALUES (?, ?, ?)',
                [ticketId, authorId, note]
            );
        }

        // NEW LOGIC: If the client confirms the resolution, automatically set the status to "Closed".
        if (isResolvedByClient === true) {
            newStatus = 'Closed';
        }

        // Dynamically build the UPDATE query for the Tickets table based on the provided data.
        const fieldsToUpdate = []; // Array to hold "column = ?" parts.
        const values = []; // Array to hold the corresponding values.
        
        // If a new status is provided, add it to the query.
        if (newStatus) {
            fieldsToUpdate.push('Status = ?');
            values.push(newStatus);
        }
        // If the unread update flag is provided, add it.
        if (clientHasUnreadUpdate !== undefined) {
            fieldsToUpdate.push('ClientHasUnreadUpdate = ?');
            values.push(clientHasUnreadUpdate);
        }
        // If the client resolution flag is provided, add it.
        if (isResolvedByClient !== undefined) {
             fieldsToUpdate.push('IsResolvedByClient = ?');
            values.push(isResolvedByClient);
        }

        // Only run the UPDATE query if there are fields to update.
        if (fieldsToUpdate.length > 0) {
            // Construct the final SQL query string.
            const sql = `UPDATE Tickets SET ${fieldsToUpdate.join(', ')} WHERE TicketID = ?`;
            // Add the ticketId to the end of the values array for the WHERE clause.
            values.push(ticketId);
            // Execute the update query.
            await query(sql, values);
        }
        
        // Fetch the complete, updated ticket object to return to the client.
        // Use the actual database column name `TicketID` in the WHERE clause.
        const [ticketData] = await query(`${ticketSelectQuery} WHERE TicketID = ?`, [ticketId]);
        // Also fetch its updated list of updates.
        // Use the actual database column name `TicketID` in the WHERE clause.
        ticketData.updates = await query(`${updatesSelectQuery} WHERE TicketID = ? ORDER BY date ASC`, [ticketId]);

        // Send the updated ticket object as the response.
        res.json(ticketData);
    } catch (error) {
        // Handle server errors.
        res.status(500).json({ message: error.message });
    }
});


// --- Server Start ---
// Start the Express server and have it listen for incoming connections on the specified port.
app.listen(PORT, () => {
  // Log a message to the console indicating that the server is running.
  console.log(`Live backend server running on http://localhost:${PORT}`);
});