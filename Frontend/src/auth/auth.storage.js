const KEY = "auth";

export function saveAuth(auth) {
  localStorage.setItem(KEY, JSON.stringify(auth));
}

export function getAuth() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

export function getAccessToken() {
  return getAuth()?.accessToken || null;
}

export function isLoggedIn() {
  return !!getAccessToken();
}
