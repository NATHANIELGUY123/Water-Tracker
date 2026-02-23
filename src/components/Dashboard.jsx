import { useState, useEffect } from 'react';
import HistoryGraph from './HistoryGraph';
import './Dashboard.css';

export default function Dashboard({ user, dailyGoal, onLogout }) {
    // Tumbler holds up to 800ml for example
    const TUMBLER_CAPACITY = 800;

    const [tumblerAmount, setTumblerAmount] = useState(TUMBLER_CAPACITY);
    const [consumedToday, setConsumedToday] = useState(0);
    const [activeTab, setActiveTab] = useState('today');

    // Web Notification setup
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);

    // Drink action
    const handleDrink = (amount) => {
        // Can't drink more than what's in the tumbler
        const actualDrink = Math.min(amount, tumblerAmount);
        if (actualDrink <= 0) return;

        setTumblerAmount(prev => prev - actualDrink);
        setConsumedToday(prev => prev + actualDrink);

        // In a real app we'd reset the inactivity timer here
    };

    const handleRefill = () => {
        setTumblerAmount(TUMBLER_CAPACITY);
    };

    const tumblerFillPercentage = (tumblerAmount / TUMBLER_CAPACITY) * 100;
    const goalPercentage = Math.min((consumedToday / dailyGoal) * 100, 100);

    return (
        <div className="dashboard-container fade-in">
            <header className="dash-header">
                <div>
                    <h2>Hello, {user.username}</h2>
                    <span className="account-badge">ID: {user.id}</span>
                </div>
                <button className="logout-btn" onClick={onLogout}>Logout</button>
            </header>

            <div className="view-toggle">
                <button
                    className={`toggle-btn ${activeTab === 'today' ? 'active' : ''}`}
                    onClick={() => setActiveTab('today')}
                >
                    Today
                </button>
                <button
                    className={`toggle-btn ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </button>
            </div>

            {activeTab === 'today' ? (
                <>
                    <div className="tumbler-section glass-panel fade-in">
                        <h3 className="section-title">Smart Tumbler</h3>
                        <p className="tumbler-subtitle">Remaining Water</p>

                        <div className="tumbler-display">
                            <div className="tumbler-wrapper">
                                <div className="tumbler-glass">
                                    <div
                                        className="water-level transition-all"
                                        style={{ height: `${tumblerFillPercentage}%` }}
                                    >
                                        <div className="wave"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="tumbler-stats">
                                <span className="huge-text">{tumblerAmount}</span>
                                <span className="unit-text">ml</span>
                            </div>
                        </div>

                        <div className="simulator-controls">
                            <button className="drink-btn" onClick={() => handleDrink(150)} disabled={tumblerAmount === 0}>
                                🥤 Take a Sip (150ml)
                            </button>
                            <button className="drink-btn" onClick={() => handleDrink(300)} disabled={tumblerAmount === 0}>
                                💧 Big Gulp (300ml)
                            </button>
                            {tumblerAmount < TUMBLER_CAPACITY && (
                                <button className="action-btn refill-btn" onClick={handleRefill}>
                                    🔄 Refill Tumbler
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="goal-section glass-panel fade-in">
                        <h3 className="section-title">Today's Goal</h3>

                        <div className="progress-bar-container">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill transition-all"
                                    style={{ width: `${goalPercentage}%` }}
                                ></div>
                            </div>
                            <div className="goal-text">
                                <span>{consumedToday}ml consumed</span>
                                <span>Target: {dailyGoal}ml</span>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <HistoryGraph dailyGoal={dailyGoal} />
            )}
        </div>
    );
}
