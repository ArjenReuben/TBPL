import type { User } from '../types';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

export const login = async (email: string, password: string): Promise<User | null> => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.error('Invalid credentials');
                return null;
            }
            throw new Error('Login request failed');
        }
        
        const user: User = await response.json();
        return user;
    } catch (error) {
        console.error('Login API error:', error);
        return null;
    }
};

export const loginAdmin = async (password: string): Promise<User | null> => {
    try {
        const response = await fetch(`${API_URL}/admin-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });

        if (!response.ok) {
             if (response.status === 401) {
                console.error('Invalid admin password');
                return null;
            }
            throw new Error('Admin login request failed');
        }
        
        const adminUser: User = await response.json();
        return adminUser;
    } catch(error) {
        console.error('Admin login API error:', error);
        return null;
    }
};
