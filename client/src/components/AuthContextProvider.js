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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/validate-session"
        );
        setIsLoggedIn(response.data.isLoggedIn);

        if (response.data.userID) {
          setUserId(response.data.userID);
          setUserRole(response.data.userRole);
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

  const loginHandler = async (data) => {
    if (data.userRole !== "guest") {
      setIsLoggedIn(true);
      setUserName(data.user_name);
      setUserId(data.userID);
      setUserRole(data.userRole);
      setReputation(data.reputation);
    } else {
      setIsLoggedIn(true);
      setUserName("Guest");
      setUserId("0");
      setUserRole("guest");
    }
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
        }
      });
    } catch (err) {
      setIsLoading(false);

      console.error("unable to log out", err);
    }
  };

  const contextValue = useMemo(
    () => ({
      isLoggedIn: isLoggedIn,
      userName: userName,
      userId: userId,
      userRole: userRole,
      userReputation: reputation,
      onLogin: loginHandler,
      onLogout: logoutHandler,
    }),
    [isLoggedIn, userName, userId, userRole, reputation]
  );
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
