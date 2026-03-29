const LOGIN_ATTEMPTS_KEY = 'login_attempts';
const LOCKOUT_KEY = 'login_lockout_until';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface LoginAttemptData {
  count: number;
  firstAttempt: number;
}

export function checkRateLimit(): { allowed: boolean; remainingSeconds: number } {
  const lockoutStr = localStorage.getItem(LOCKOUT_KEY);
  if (lockoutStr) {
    const lockoutUntil = Number(lockoutStr);
    const now = Date.now();
    if (now < lockoutUntil) {
      return { allowed: false, remainingSeconds: Math.ceil((lockoutUntil - now) / 1000) };
    }
    // Lockout expired, clear
    localStorage.removeItem(LOCKOUT_KEY);
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
  }
  return { allowed: true, remainingSeconds: 0 };
}

export function recordFailedAttempt(): { locked: boolean; remainingAttempts: number } {
  const dataStr = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
  let data: LoginAttemptData = dataStr ? JSON.parse(dataStr) : { count: 0, firstAttempt: Date.now() };
  
  // Reset if window expired (10 minutes)
  if (Date.now() - data.firstAttempt > 10 * 60 * 1000) {
    data = { count: 0, firstAttempt: Date.now() };
  }
  
  data.count++;
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(data));
  
  if (data.count >= MAX_ATTEMPTS) {
    localStorage.setItem(LOCKOUT_KEY, String(Date.now() + LOCKOUT_DURATION_MS));
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
    return { locked: true, remainingAttempts: 0 };
  }
  
  return { locked: false, remainingAttempts: MAX_ATTEMPTS - data.count };
}

export function clearLoginAttempts(): void {
  localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
  localStorage.removeItem(LOCKOUT_KEY);
}
