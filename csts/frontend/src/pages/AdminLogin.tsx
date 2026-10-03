// FIX: Replaced placeholder content with a full implementation.
// This component provides the password-only login form for administrators.
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';
import nhIcon from '../assets/nh-icon.png';

const AdminLogin: React.FC = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { loginAdmin } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const user = await loginAdmin(password);
            if (!user) {
                setError('Invalid admin password.');
            }
            // On successful login, the App component will automatically render the dashboard.
        } catch (err) {
            setError('An unexpected error occurred. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-primary flex flex-col justify-center items-center p-4 font-sans">
            <div className="w-full max-w-sm">
                 <div className="flex justify-center items-center gap-3 mb-6">
                    <img src={nhIcon} alt="New Horizons" className="h-14 w-14 rounded-full shadow-md" />
                    <h1 className="text-3xl font-bold text-white">Admin Access</h1>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-brand-secondary">
                     <div className="text-center mb-6">
                        <h2 className="text-2xl font-semibold text-slate-700">System Login</h2>
                        <p className="text-slate-500 text-sm mt-1">Enter the administrator password.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Admin Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50"
                            >
                                {loading && <Spinner small />}
                                {loading ? 'Authenticating...' : 'Authenticate'}
                            </button>
                        </div>
                    </form>
                </div>
                 <div className="text-center mt-6 text-sm text-brand-accent">
                    <p>This is a restricted access page. <a href="/login" className="font-medium text-white hover:underline">Return to login</a></p>
                </div>
            </div>
             <style dangerouslySetInnerHTML={{ __html: `
                .form-input {
                    display: block;
                    width: 100%;
                    border-radius: 0.5rem;
                    border: 1px solid #cbd5e1;
                    padding: 0.75rem 1rem;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                }
                .form-input:focus {
                    outline: none;
                    border-color: #4338ca;
                    box-shadow: 0 0 0 3px rgb(67 56 202 / 0.2);
                }
            `}}/>
        </div>
    );
};

export default AdminLogin;
