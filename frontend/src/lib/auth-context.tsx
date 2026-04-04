import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  name: string;
  username: string;
  email: string;
  phone: string;
  city: string;
  joinDate: string;
  transportPrefs: string[];
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  signup: (data: User) => void;
  login: (key: string, _pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check local storage on mount
    const loggedInStr = localStorage.getItem('fc_is_logged_in');
    if (loggedInStr === 'true') {
      setIsLoggedIn(true);
      const transportStr = localStorage.getItem('fc_transport');
      setUser({
        name: localStorage.getItem('fc_name') || 'Rohan Acharya',
        username: localStorage.getItem('fc_username') || 'rohan_acharya',
        email: localStorage.getItem('fc_email') || 'rohan@example.com',
        phone: localStorage.getItem('fc_phone') || '+91 98765 43210',
        city: localStorage.getItem('fc_city') || 'Mumbai, Maharashtra',
        joinDate: localStorage.getItem('fc_joined') || 'Jan 2026',
        transportPrefs: transportStr ? JSON.parse(transportStr) : ['metro', 'bus']
      });
    }
  }, []);

  const signup = (data: User) => {
    localStorage.setItem('fc_name', data.name);
    localStorage.setItem('fc_username', data.username);
    localStorage.setItem('fc_email', data.email);
    localStorage.setItem('fc_phone', data.phone);
    localStorage.setItem('fc_city', data.city);
    localStorage.setItem('fc_joined', data.joinDate);
    localStorage.setItem('fc_transport', JSON.stringify(data.transportPrefs));
    localStorage.setItem('fc_is_logged_in', 'true');
    setUser(data);
    setIsLoggedIn(true);
  };

  const login = (key: string, _pass: string) => {
    const storedEmail = localStorage.getItem('fc_email');
    const storedUser = localStorage.getItem('fc_username');
    
    // For demo purposes, we do a loose check.
    if (!storedEmail && !storedUser) {
        // Fallback for demo: just log them in anyway with mock data
        setIsLoggedIn(true);
        setUser({
          name: 'Rohan Acharya',
          username: 'rohan_acharya',
          email: 'rohan@example.com',
          phone: '+91 98765 43210',
          city: 'Mumbai, Maharashtra',
          joinDate: 'Jan 2026',
          transportPrefs: ['metro', 'bus']
        });
        localStorage.setItem('fc_is_logged_in', 'true');
        return true;
    }

    if ((storedEmail === key) || (storedUser === key)) {
      localStorage.setItem('fc_is_logged_in', 'true');
      setIsLoggedIn(true);
      const transportStr = localStorage.getItem('fc_transport');
      setUser({
        name: localStorage.getItem('fc_name')!,
        username: localStorage.getItem('fc_username')!,
        email: localStorage.getItem('fc_email')!,
        phone: localStorage.getItem('fc_phone') || '',
        city: localStorage.getItem('fc_city')!,
        joinDate: localStorage.getItem('fc_joined')!,
        transportPrefs: transportStr ? JSON.parse(transportStr) : []
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('fc_is_logged_in');
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
