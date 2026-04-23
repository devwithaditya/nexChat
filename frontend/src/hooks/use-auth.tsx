import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { loginUser, registerUser } from "../lib/api";

type CurrentUser = { username: string; loggedIn: true } | null;

type AuthMode = "loading" | "onboarding" | "login" | "authed";

type AuthContextValue = {
  currentUser: CurrentUser;
  mode: AuthMode;
  isNewUser: boolean;
  register: (username: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  switchToLogin: () => void;
  switchToOnboarding: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
  const [mode, setMode] = useState<AuthMode>("loading");
  const [isNewUser, setIsNewUser] = useState(true);

  // =========================
  // 🔥 INIT AUTH
  // =========================
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const savedUser = sessionStorage.getItem("user");

      if (savedUser) {
        const parsed = JSON.parse(savedUser);

        if (parsed?.username) {
          setCurrentUser(parsed);
          setMode("authed");
          setIsNewUser(false);
          return;
        }
      }

      setMode("login");
      setIsNewUser(true);
    } catch (err) {
      console.error("Auth init error:", err);
      setMode("login");
    }
  }, []);

  // =========================
  // 🔥 REGISTER (FIXED)
  // =========================
  const register = async (username: string, password: string) => {
    try {
      const res = await registerUser(username, password);

      const user: CurrentUser = {
        username: res.username,
        loggedIn: true,
      };

      sessionStorage.setItem("user", JSON.stringify(user));

      setCurrentUser(user);
      setMode("authed");
      setIsNewUser(false);

    } catch (err: any) {
      console.log("REGISTER ERROR:", err);

      const message =
        err?.response?.data?.msg ||   // axios backend
        err?.message ||               // fallback
        "Registration failed";

      if (message.toLowerCase().includes("taken")) {
        throw new Error("Username already exists"); // ✅ FIXED MESSAGE
      }

      throw new Error(message);
    }
  };

  // =========================
  // 🔥 LOGIN
  // =========================
  const login = async (username: string, password: string) => {
    try {
      const res = await loginUser(username, password);

      const user: CurrentUser = {
        username: res.username,
        loggedIn: true,
      };

      sessionStorage.setItem("user", JSON.stringify(user));

      setCurrentUser(user);
      setMode("authed");

    } catch (err: any) {
      const message =
        err?.response?.data?.msg ||
        err?.message ||
        "Login failed";

      throw new Error(message);
    }
  };

  // =========================
  // 🔥 LOGOUT
  // =========================
  const logout = () => {
    sessionStorage.removeItem("user");
    setCurrentUser(null);
    setMode("login");
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        mode,
        isNewUser,
        register,
        login,
        logout,
        switchToLogin: () => setMode("login"),
        switchToOnboarding: () => setMode("onboarding"),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =========================
// 🔥 HOOK
// =========================
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}