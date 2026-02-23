import { useState, useEffect } from 'react';
import './Onboarding.css';

export default function Onboarding({ onComplete }) {
    const [step, setStep] = useState(1);
    const [isConnecting, setIsConnecting] = useState(false);
    const [age, setAge] = useState('');

    const handleConnect = () => {
        setIsConnecting(true);
        // Simulate connection delay
        setTimeout(() => {
            setIsConnecting(false);
            setStep(2);
        }, 2500);
    };

    const handleComplete = (e) => {
        e.preventDefault();
        if (!age) return;

        const numAge = parseInt(age, 10);
        let dailyGoal = 2000; // Default fallback

        // Simple age-based logic as requested
        if (numAge < 18) dailyGoal = 1800;
        else if (numAge >= 18 && numAge <= 26) dailyGoal = 2000;
        else if (numAge > 26 && numAge <= 50) dailyGoal = 2500;
        else dailyGoal = 2200;

        onComplete({ age: numAge, dailyGoal });
    };

    return (
        <div className="onboarding-container glass-panel">
            {step === 1 && (
                <div className="step connect-step">
                    <div className="icon-pulse">
                        <span className="material-icon">💧</span>
                    </div>
                    <h2>Connect Your Tumbler</h2>
                    <p>Make sure your smart tumbler is powered on and nearby.</p>

                    <button
                        className={`connect-btn ${isConnecting ? 'loading' : ''}`}
                        onClick={handleConnect}
                        disabled={isConnecting}
                    >
                        {isConnecting ? 'Searching...' : 'Connect Target'}
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="step profile-step fade-in">
                    <h2>Setup Profile</h2>
                    <p>We need your age to calculate your optimal daily hydration goal.</p>

                    <form onSubmit={handleComplete}>
                        <div className="input-group">
                            <label htmlFor="age">Your Age</label>
                            <input
                                id="age"
                                type="number"
                                min="5"
                                max="120"
                                placeholder="e.g. 24"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="continue-btn">
                            Start Tracking
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
