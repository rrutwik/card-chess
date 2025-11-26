import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { logout as apiLogout, getUserDetails } from "../services/api";
import { logger } from "../utils/logger";

export interface User {
  _id: string;
  email: string;
  first_name?: string;
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
      logger.info("🚀 AuthContext: Initializing authentication...");

      logger.info("🔍 AuthContext: Found existing token, validating...");
      try {
        // Validate the token by making an API call
        const data = await getUserDetails(true);
        setUser(data);
        setUpdateTrigger((prev) => prev + 1); // Force re-render
        logger.info("✅ AuthContext: Token validated, user set:", { userId: data._id });
      } catch (error) {
        // Token is invalid or expired, clear it
        logger.warn(
          "❌ AuthContext: Token validation failed, clearing stored auth data",
          error
        );
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      }

      setIsLoading(false);
      logger.info("✅ AuthContext: Initialization complete");
    };

    initializeAuth();
  }, []);

  const login = (user: User) => {
    logger.info("🔑 AuthContext: Login called", { userId: user._id });
    localStorage.setItem("userData", JSON.stringify(user));
    setUser(user);
    setUpdateTrigger((prev) => prev + 1); // Force re-render
    logger.info("✅ AuthContext: User state updated");
  };

  const logout = () => {
    logger.info("🔓 AuthContext: Logout called");
    apiLogout();
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    setUser(null);
    setUpdateTrigger((prev) => prev + 1); // Force re-render
    logger.info("✅ AuthContext: User logged out");
  };

  const value: AuthContextType = useMemo(() => {
    const computedValue = {
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isLoading,
    };
    logger.debug("🔄 AuthContext: Context value computed", { isAuthenticated: !!user, isLoading });
    return computedValue;
  }, [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
