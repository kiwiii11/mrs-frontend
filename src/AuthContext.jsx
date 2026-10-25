import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const saveUser = (authResponse) => {
    localStorage.setItem("user", JSON.stringify(authResponse));
    setUser(authResponse);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const isAdmin = String(user?.role || "").toUpperCase().includes("ADMIN");

  return (
    <AuthContext.Provider value={{ user, saveUser, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);