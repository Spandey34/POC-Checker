import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { getAllPOCs } from '../services/pocService';
import {useDbUser} from './UserContext';
import { getAllUsers } from '../services/userService';

const CountContext =
  createContext(null);

export function CountProvider({
  children,
}) {
    const [recentCount, setRecentCount] = useState(0);
    const [usersCount, setUsersCount] = useState(0);//To be implemented in future...
    const [verifiedCount, setVerifiedCount] = useState(0);//To be implemented in future...
    const [allPOCs,setAllPOCs] = useState([]);
    const { dbUser } = useDbUser();

    const loadAllPOCs = useCallback(async () => {
        try {
          const data = await getAllPOCs();
          setAllPOCs(data);
        } catch (err) {
          console.error(err);
        }
      }, []);

    const getUsers = useCallback(async () => {
        try{
            const response = await getAllUsers(null, 10000); 
      const data = response.data || response;
      
      setUsersCount(data.length);
      const verifiedUsers = data.filter((user) => user.isVerified);
      setVerifiedCount(verifiedUsers.length);
        } catch(err){
            console.error(err);
        }
    },[])

    
    useEffect(() => {
    if(dbUser &&  dbUser.role === 'admin' )
    {
        loadAllPOCs();
        getUsers();
    }
  }, [dbUser]);
  return (
    <CountContext.Provider
      value={{
        recentCount, setRecentCount, usersCount, verifiedCount, allPOCs, setAllPOCs
      }}
    >
      {children}
    </CountContext.Provider>
  );
}

export const useCount =
  () =>
    useContext(
      CountContext
    );