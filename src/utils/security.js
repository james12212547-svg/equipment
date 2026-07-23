// Security Lockout System
// Tracks failed login attempts per email using localStorage
// After MAX_ATTEMPTS failures within WINDOW_MS, locks for LOCKOUT_MS

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const WINDOW_MS = 10 * 60 * 1000;  // track within 10 minute window
const STORAGE_KEY = 'sec_login_attempts';

const getData = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

/** Returns { locked: bool, remainingMs: number, attempts: number } for an email */
export const getLockStatus = (email) => {
  const data = getData();
  const record = data[email];
  if (!record) return { locked: false, remainingMs: 0, attempts: 0 };

  const now = Date.now();

  // Clear old attempts outside the window
  record.attempts = record.attempts.filter(t => now - t < WINDOW_MS);

  if (record.lockedUntil && now < record.lockedUntil) {
    return { locked: true, remainingMs: record.lockedUntil - now, attempts: record.attempts.length };
  }

  if (record.lockedUntil && now >= record.lockedUntil) {
    // Lockout expired — clear it
    delete data[email];
    saveData(data);
    return { locked: false, remainingMs: 0, attempts: 0 };
  }

  return { locked: false, remainingMs: 0, attempts: record.attempts.length };
};

/** Call this on a failed login attempt. Returns new lockout status. */
export const recordFailedAttempt = (email) => {
  const data = getData();
  const now = Date.now();

  if (!data[email]) data[email] = { attempts: [], lockedUntil: null };
  const record = data[email];

  // Prune old attempts
  record.attempts = record.attempts.filter(t => now - t < WINDOW_MS);
  record.attempts.push(now);

  if (record.attempts.length >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }

  saveData(data);
  return getLockStatus(email);
};

/** Call this on a successful login. Clears all attempt history. */
export const clearFailedAttempts = (email) => {
  const data = getData();
  delete data[email];
  saveData(data);
};

/** Format remaining lockout time as "MM:SS" */
export const formatLockTimer = (ms) => {
  if (ms <= 0) return '00:00';
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};
