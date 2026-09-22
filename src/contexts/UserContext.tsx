import { createContext, useContext, useState, ReactNode } from 'react';

interface UserProfile {
  id: string;
  phone_number: string;
  display_name: string;
  how_found_us: string | null;
  shopping_interests: string[] | null;
  avatar_url: string | null;
}

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isOnboarded: boolean;
  isGuest: boolean;
  setUser: (user: UserProfile | null) => void;
  setIsGuest: (isGuest: boolean) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isGuest] = useState(true); // Always treat as guest - no auth required

  return (
    <UserContext.Provider value={{
      user,
      isLoading: false,
      isOnboarded: true, // Always onboarded - no auth gate
      isGuest: true,
      setUser: (userData) => setUser(userData as UserProfile | null),
      setIsGuest: () => {}, // No-op
      logout: () => setUser(null)
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
