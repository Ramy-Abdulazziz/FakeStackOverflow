import { useState, useEffect, useContext } from "react";
import AuthContext from "./authContext";
import axios from "axios";
import QuestionContext from "./questionContext";
export default function AuthContextProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reputation, setReputation] = useState(0);
  const [user, setUser] = useState(null);
  const [signUp, setSignUp] = useState(new Date());
  const questionContext = useContext(QuestionContext);

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
          setReputation(response.data.reputation);
          setUserName(response.data.userName);
          setSignUp(response.data.signup);
          setUser(response.data.user);
        } else if (response.data.userRole === "guest") {
          setUserId("0");
          setUserName("Guest");
          setUserRole("guest");
        }
      } catch (err) {
        console.error("error fetching validation info", err);
      } finally {
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
      setUser(data.user);
    } else {
      setIsLoggedIn(true);
      setUserName("Guest");
      setUserId("0");
      setUserRole("guest");
    }
  };

  const refreshUserInfo = async () => {
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
        setSignUp(response.data.signup);
        setUser(response.data.user);

        questionContext.fetchUser(); 
      } else if (response.data.userRole === "guest") {
        setUserId("0");
        setUserName("Guest");
        setUserRole("guest");
      }
    } catch (err) {
      console.error("error fetching validation info", err);
    }
  };

  const logoutHandler = async () => {
    try {
      await axios.post("http://localhost:8000/logout").then((response) => {
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
        signUp: signUp,
        isLoading: isLoading,
        refreshUserInfo: refreshUserInfo,
        onLogin: loginHandler,
        onLogout: logoutHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
