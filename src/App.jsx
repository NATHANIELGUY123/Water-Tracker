import { useState, useEffect, useRef } from 'react'
import Auth from './components/Auth'
import Onboarding from './components/Onboarding'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [user, setUser] = useState(null);
  const [dailyGoal, setDailyGoal] = useState(null);
  const [lastDrinkTime, setLastDrinkTime] = useState(Date.now());
  const timerRef = useRef(null);

  // Inactivity Notification Logic (e.g. 5 seconds for testing, realistically 2 hours)
  const NOTIFICATION_INTERVAL = 30000; // 30 seconds for quick testing

  useEffect(() => {
    // Only run timer if user is fully onboarded
    if (!user || !dailyGoal) return;

    const checkInactivity = () => {
      const now = Date.now();
      if (now - lastDrinkTime >= NOTIFICATION_INTERVAL) {
        sendNotification();
        // Reset timer to prevent spam, or wait for next drink
        setLastDrinkTime(Date.now());
      }
    };

    timerRef.current = setInterval(checkInactivity, 5000); // Check every 5s

    return () => clearInterval(timerRef.current);
  }, [user, dailyGoal, lastDrinkTime]);

  const sendNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification("Time to Hydrate! 💧", {
        body: "You haven't taken a sip from your Smart Tumbler in a while.",
        icon: "/vite.svg" // Placeholder icon
      });
    } else {
      console.log("Mock Notification: Time to drink water!");
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleOnboardingComplete = (data) => {
    setDailyGoal(data.dailyGoal);
    setLastDrinkTime(Date.now()); // Start tracking when they finish setup
  };

  const handleLogout = () => {
    setUser(null);
    setDailyGoal(null);
  };

  // Render State Machine
  if (!user) {
    return (
      <div className="app-container">
        <h1>HydroSync</h1>
        <Auth onLogin={handleLogin} />
      </div>
    );
  }

  if (!dailyGoal) {
    return (
      <div className="app-container">
        <h1>HydroSync</h1>
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="app-container" onClick={() => setLastDrinkTime(Date.now())}>
      {/* 
        We pass a click handler here just to simulate "activity" resetting the timer for testing, 
        but in reality it would be the tumbler sensor triggering a drink event 
      */}
      <Dashboard user={user} dailyGoal={dailyGoal} onLogout={handleLogout} />
    </div>
  );
}

export default App
