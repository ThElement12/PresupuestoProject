const STORAGE_KEY = 'usuario';

export function getStoredToken() {
  return localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
}

export function getStoredUsuario() {
  const raw = getStoredToken();
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUsuario(userData, rememberMe) {
  const raw = JSON.stringify(userData);
  if (rememberMe) {
    localStorage.setItem(STORAGE_KEY, raw);
    sessionStorage.removeItem(STORAGE_KEY);
  } else {
    sessionStorage.setItem(STORAGE_KEY, raw);
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function clearStoredUsuario() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}
