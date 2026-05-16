import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useClerk, useUser } from '@clerk/clerk-react';
import { injectTokenGetter } from '../services/api';
import { getMe } from '../services/userService';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      injectTokenGetter(null);
      setDbUser(null);
      setLoading(false);
      return;
    }

    const email =
      user?.primaryEmailAddress?.emailAddress;

    if (
      email &&
      !email.endsWith('@nitjsr.ac.in')
    ) {
      alert('Only NIT JSR emails allowed');
      signOut();
      return;
    }

    (async () => {
      try {
        const token = await getToken();

        injectTokenGetter(token);

        const userData = await getMe();

        setDbUser(userData);
      } catch {
        setDbUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoaded, isSignedIn, user]);

  const refreshUser = async () => {
    try {
      const token = await getToken();

      injectTokenGetter(token);

      const userData = await getMe();

      setDbUser(userData);
    } catch {
      setDbUser(null);
    }
  };

  return (
    <UserContext.Provider
      value={{
        dbUser,
        loading,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useDbUser = () =>
  useContext(UserContext);