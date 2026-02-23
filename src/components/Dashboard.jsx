import { useState, useEffect } from 'react';
import HistoryGraph from './HistoryGraph';
import './Dashboard.css';
import { logDrink, getUserHistory, setTumblerVolume } from '../services/db';

export default function Dashboard({ user, dailyGoal, onLogout }) {
    // Tumbler holds up to 1000ml for example
    const TUMBLER_CAPACITY = 1000;

    const [tumblerAmount, setTumblerAmount] = useState(user.tumblerVolume !== undefined ? user.tumblerVolume : TUMBLER_CAPACITY);

    // Calculate consumed today from actual DB history
    const [history, setHistory] = useState([]);
    const [consumedToday, setConsumedToday] = useState(0);
    const [activeTab, setActiveTab] = useState('today');

    // On mount, load history
    useEffect(() => {
        const userHist = getUserHistory(user.id);
        setHistory(userHist);

        // Calculate today's total
        const todayStr = new Date().toLocaleDateString('en-US');
        const todayDrinks = userHist.filter(log => {
            const logDate = new Date(log.timestamp).toLocaleDateString('en-US');
            return logDate === todayStr;
        });

        const total = todayDrinks.reduce((sum, log) => sum + log.amount, 0);
        setConsumedToday(total);
    }, [user.id]);

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

        const newVolume = tumblerAmount - actualDrink;
        setTumblerAmount(newVolume);
        setConsumedToday(prev => prev + actualDrink);

        // Persist tumbler volume locally
        setTumblerVolume(user.id, newVolume);

        // Log to database
        logDrink(user.id, actualDrink);
        // Refresh local history state
        setHistory(getUserHistory(user.id));

        // In a real app we'd reset the inactivity timer here
    };

    const handleRefill = () => {
        setTumblerAmount(TUMBLER_CAPACITY);
        setTumblerVolume(user.id, TUMBLER_CAPACITY);
    };

    // NFC Functionality
    const [nfcMessage, setNfcMessage] = useState('');
    const [nfcLogAmount, setNfcLogAmount] = useState(300);

    const startNfcScan = async () => {
        if (!('NDEFReader' in window)) {
            setNfcMessage("Web NFC is not supported on this device/browser.");
            return;
        }

        try {
            setNfcMessage("Ready to scan... Hold your device near the smart tumbler tag.");
            const ndef = new window.NDEFReader();
            await ndef.scan();

            ndef.addEventListener("readingerror", () => {
                setNfcMessage("Error reading NFC tag. Try again.");
            });

            ndef.addEventListener("reading", () => {
                setNfcMessage(`Tag detected! Logging a ${nfcLogAmount}ml drink...`);
                // Automatically log a drink when tapped
                handleDrink(nfcLogAmount);
                setTimeout(() => setNfcMessage("Drink logged successfully!"), 2000);
            });
        } catch (error) {
            setNfcMessage("Error starting NFC scan: " + error.message);
        }
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
                    className={`toggle-btn ${activeTab === 'nfc' ? 'active' : ''}`}
                    onClick={() => setActiveTab('nfc')}
                >
                    NFC
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
            ) : activeTab === 'nfc' ? (
                <div className="nfc-section glass-panel fade-in">
                    <h3 className="section-title">NFC Tag Scanner</h3>
                    <p className="tumbler-subtitle">Tap your smart tumbler to instantly log a drink.</p>

                    <div className="nfc-status">
                        <div className="nfc-link-generator">
                            <label className="tumbler-subtitle">Customize Scan Amount (ml):</label>
                            <input
                                type="number"
                                value={nfcLogAmount}
                                onChange={(e) => setNfcLogAmount(Math.max(1, parseInt(e.target.value) || 0))}
                                className="nfc-link-input"
                                style={{ marginBottom: '1rem', width: '100px', display: 'block', margin: '0.5rem auto 1.5rem' }}
                            />

                            <label className="tumbler-subtitle">Program this URL to your NFC Tag:</label>
                            <div className="link-copy-row">
                                <input
                                    type="text"
                                    readOnly
                                    value={`${window.location.origin}/?nfcLog=${nfcLogAmount}&userId=${user.id}`}
                                    className="nfc-link-input"
                                />
                                <button className="copy-btn" onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/?nfcLog=${nfcLogAmount}&userId=${user.id}`);
                                    setNfcMessage("Link copied! You can now paste this anywhere.");
                                }}>
                                    Copy Link
                                </button>
                            </div>
                        </div>

                        <div className="nfc-divider">- OR DIRECT SCAN -</div>

                        <button className="auth-btn nfc-scan-btn" onClick={startNfcScan}>
                            📱 Scan NFC Tag Directly
                        </button>
                        <p className="nfc-message" style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>{nfcMessage}</p>
                    </div>
                </div>
            ) : (
                <HistoryGraph dailyGoal={dailyGoal} historyData={history} />
            )}
        </div>
    );
}
