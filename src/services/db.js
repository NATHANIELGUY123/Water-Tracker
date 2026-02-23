// A simple local storage wrapper acting as our database
const DB_KEY = 'water_tracker_db';

// Initial structure
const initDB = () => {
    const db = localStorage.getItem(DB_KEY);
    if (!db) {
        localStorage.setItem(DB_KEY, JSON.stringify({
            users: [],
            history: {} // key: userId, value: array of drink logs
        }));
    }
};

export const getDB = () => {
    initDB();
    return JSON.parse(localStorage.getItem(DB_KEY));
};

export const saveDB = (db) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// --- AUTHENTICATION ---
export const registerUser = (username, password) => {
    const db = getDB();
    const existing = db.users.find(u => u.username === username);
    if (existing) {
        throw new Error("Username already taken.");
    }

    // In a real app password would be hashed. For this prototype, we store in plaintext
    // Generate a unique ID
    const accountId = 'USR-' + Math.floor(100 + Math.random() * 900);
    const newUser = { id: accountId, username, password, createdAt: new Date().toISOString() };

    db.users.push(newUser);
    // Initialize history array for this user
    db.history[accountId] = [];

    saveDB(db);
    return { ...newUser }; // Return copy
};

export const loginUser = (username, password) => {
    const db = getDB();
    const user = db.users.find(u => u.username === username);

    if (!user) {
        throw new Error("User not found.");
    }

    if (user.password !== password) {
        throw new Error("Incorrect password.");
    }

    return { ...user };
};

export const setUserGoal = (userId, goal) => {
    const db = getDB();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        db.users[userIndex].dailyGoal = goal;
        saveDB(db);
    }
};

// --- DATA LOGGING ---
export const logDrink = (userId, amount) => {
    const db = getDB();
    if (!db.history[userId]) {
        db.history[userId] = [];
    }

    const timestamp = new Date().toISOString();
    db.history[userId].push({
        amount,
        timestamp
    });

    saveDB(db);
};

export const getUserHistory = (userId) => {
    const db = getDB();
    return db.history[userId] || [];
};

export const clearHistory = (userId) => {
    const db = getDB();
    db.history[userId] = [];
    saveDB(db);
};
