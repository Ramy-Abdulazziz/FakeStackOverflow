import { useState, useEffect, useMemo } from "react";
import AuthContext from "./authContext";
import axios from "axios";
export default function AuthContextProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reputation, setReputation] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      console.log('resetting user data')
      try {
        const response = await axios.get(
          "http://localhost:8000/validate-session"
        );
        setIsLoggedIn(response.data.isLoggedIn);
        if (response.data.userID) {

          setUserId(response.data.userID);
          setUserRole(response.data.userRole);
          setReputation(response.data.reputation);
          setUserName(response.data.userName); 
          
        } else if (response.data.userRole === "guest") {
          setUserId("0");
          setUserName("Guest");
          setUserRole("guest");
        }
      } catch (err) {
        console.log("error fetching validation info", err);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.userRole !== "guest") {
        console.log(user);
        setIsLoggedIn(true);
        setUserName(user.user_name);
        setUserId(user.userID);
        setUserRole(user.userRole);
        setReputation(user.reputation);
      } else {
        setIsLoggedIn(true);
        setUserName("Guest");
        setUserId("0");
        setUserRole("guest");
      }
    } else {
      setIsLoggedIn(false);
      setUserName("");
      setUserId("");
      setUserRole("");
      setReputation(0);
    }
  }, [user]);

  const loginHandler = async (data) => {
    console.log(data);
    setUser(data);
  };

  const logoutHandler = async () => {
    try {
      await axios.post("http://localhost:8000/logout").then((response) => {
        console.log(response.status);
        if (response.status === 200) {
          setIsLoggedIn(false);
          setUserName("");
          setUserId("");
          setUserRole("");
          setReputation(0);
          setUser(null);
        }
      });
    } catch (err) {
      setIsLoading(false);

      console.error("unable to log out", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: isLoggedIn,
        userName: userName,
        userId: userId,
        userRole: userRole,
        reputation: reputation,
        user: user,
        onLogin: loginHandler,
        onLogout: logoutHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
