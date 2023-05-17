import { useState, useEffect, useMemo } from "react";
import AuthContext from "./authContext";
import axios from "axios";
export default function AuthContextProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [allQuestions, setAllQuestions] = useState([]);

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
      try {
        const response = await axios.get("http://localhost:8000/questions");
        console.log("response", response.data);

        setAllQuestions(
          response.data.sort(
            (a, b) => new Date(b.ask_date) - new Date(a.ask_date)
          )
        );
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
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
        if (response.status === 200) {
          setIsLoggedIn(false);
          setUserName("");
          setUserId("");
          setUserRole("");
        }
      });
    } catch (err) {
      console.error("unable to log out", err);
    }
  };

  const handleSort = async (params) => {
    console.log("sending request for " + params.sort);

    try {
      const response = await axios.get("http://localhost:8000/questions", {
        params: params,
      });
      console.log("received" + response.data);

      setAllQuestions(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const contextValue = useMemo(
    () => ({
      isLoggedIn: isLoggedIn,
      userName: userName,
      userId: userId,
      userRole: userRole,
      allQuestions: allQuestions,
      onLogin: loginHandler,
      onLogout: logoutHandler,
      onSort: handleSort,
    }),
    [isLoggedIn, userName, userId, userRole, allQuestions]
  );
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
