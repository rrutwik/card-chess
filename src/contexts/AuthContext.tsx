import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { getUserDetails } from "../services/api";

export interface User {
  _id: string;
  email: string;
  name?: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    // Check for existing auth token on app start and validate it
    const initializeAuth = async () => {
      console.log("🚀 AuthContext: Initializing authentication...");

      console.log("🔍 AuthContext: Found existing token, validating...");
      try {
        // Validate the token by making an API call
        const data = await getUserDetails(true);
        setUser(data);
        setUpdateTrigger((prev) => prev + 1); // Force re-render
        console.log("✅ AuthContext: Token validated, user set:", data);
      } catch (error) {
        // Token is invalid or expired, clear it
        console.warn(
          "❌ AuthContext: Token validation failed, clearing stored auth data"
        );
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      }

      setIsLoading(false);
      console.log("✅ AuthContext: Initialization complete");
    };

    initializeAuth();
  }, []);

  const login = (user: User) => {
    console.log("🔑 AuthContext: Login called with user:", user);
    // Token is already stored in localStorage by the API service
    localStorage.setItem("userData", JSON.stringify(user));
    setUser(user);
    setUpdateTrigger((prev) => prev + 1); // Force re-render
    console.log("✅ AuthContext: User state updated");
  };

  const logout = () => {
    console.log("🔓 AuthContext: Logout called");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
    setUpdateTrigger((prev) => prev + 1); // Force re-render
    console.log("✅ AuthContext: User logged out");
  };

  const value: AuthContextType = useMemo(() => {
    const computedValue = {
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isLoading,
    };
    console.log("🔄 AuthContext: Context value computed:", computedValue);
    return computedValue;
  }, [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
