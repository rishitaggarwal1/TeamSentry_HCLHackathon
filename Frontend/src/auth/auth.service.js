import { authApi } from "../api/auth.api";
import { getAuth, saveAuth, clearAuth } from "./auth.storage";

function getOrCreateDeviceId() {
  const k = "device_id";
  let id = localStorage.getItem(k);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(k, id);
  }
  return id;
}

export const authService = {
  async login({ email, password }) {
    const deviceId = getOrCreateDeviceId();

    const data = await authApi.login({
      email,
      password,
      deviceId,
      deviceName: navigator.userAgent,
    });

    // Backend returns: accessToken, refreshToken, sessionId, role
    saveAuth({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      sessionId: data.sessionId,
      role: data.role,
    });

    return data;
  },

  async refresh() {
    const auth = getAuth();
    if (!auth?.refreshToken || !auth?.sessionId) throw new Error("No refresh session");

    const data = await authApi.refresh({
      refreshToken: auth.refreshToken,
      sessionId: auth.sessionId,
    });
    


    // refresh returns accessToken + role (in your backend)
    saveAuth({
      ...auth,
      accessToken: data.accessToken,
      role: data.role ?? auth.role,
    });

    return data;
  },

  async logout() {
    const auth = getAuth();
    try {
      if (auth?.sessionId) await authApi.logout({ sessionId: auth.sessionId });
    } finally {
      clearAuth();
    }
  },

  async register({ name, email, password }) {
    return await authApi.register({ name, email, password });
  },
  
};
