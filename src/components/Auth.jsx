import { useState } from 'react';
import './Auth.css';
import { registerUser, loginUser } from '../services/db';

export default function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isLogin) {
                const user = loginUser(username, password);
                onLogin(user);
            } else {
                if (username.length < 3) throw new Error("Username must be at least 3 characters");
                if (password.length < 4) throw new Error("Password must be at least 4 characters");

                const newUser = registerUser(username, password);
                onLogin(newUser);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-container glass-panel">
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="auth-subtitle">
                {isLogin ? 'Log in to sync your smart tumbler.' : 'Join to start tracking your hydration.'}
            </p>
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="auth-btn">
                    {isLogin ? 'Log In' : 'Sign Up'}
                </button>
            </form>

            <p className="auth-switch">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); }}>
                    {isLogin ? 'Sign up' : 'Log in'}
                </a>
            </p>
        </div>
    );
}
