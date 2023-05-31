import { useState, useEffect, useContext } from "react";
import AuthContext from "./authContext";
import axios from "axios";
import AdminContext from "./adminContext";

export default function AdminContextProvider({ children }) {
  const [handlingUserID, setHandlingUserID] = useState("");
  const [handlingUsername, setHandlingUserName] = useState("");
  const [handlingUser, setHandlingUser] = useState(null);
  const [userId, setUserId] = useState("");
  const [showAdminOption, setShowAdminOptions] = useState(false);
  const [userQuestions, setUserQuestions] = useState([]);
  const authContext = useContext(AuthContext);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const onLogin = async () => {
    setUserId(authContext.userId);
  };
  const deleteUser = async (id) => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this user? This cannot be reversed!"
    );

    if (!confirmation) {
      return;
    }
    try {
      const response = await axios.delete(
        `http://localhost:8000/admin/${id}/delete`
      );

      return response;
    } catch (err) {
      console.error(err);
    }
  };

  const onUserClick = async (user) => {
    try {
      console.log(user);
      setHandlingUser(user);
      setHandlingUserName(user.user_name);
      setHandlingUserID(user._id);
      setShowAdminOptions(true);
    } catch (err) {
      console.log(err);
    }
  };

  const getUserQuestions = async () => {
    try {
      setLoadingQuestions(true);
      console.log(authContext.userId);
      const response = await axios.get(
        `http://localhost:8000/questions/user/${handlingUserID}`
      );
      console.log(response);
      setUserQuestions(
        response.data.sort(
          (a, b) => new Date(b.ask_date) - new Date(a.ask_date)
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const refreshUser = async () => {
    if (handlingUser === null) {
      return;
    }

    try {
      const user = await axios.get(
        `http://localhost:8000/admin/user/${handlingUserID}`
      );
      setHandlingUser(user);
      getUserQuestions();
    } catch (err) {
      console.log(err);
    }
  };

  const exitMenu = () =>{

    // setShowAdminOptions(false); 
  }

  return (
    <AdminContext.Provider
      value={{
        userId: userId,
        handlingUser: handlingUser,
        handlingUsername: handlingUsername,
        handlingUserID: handlingUserID,
        showAdminOption: showAdminOption,
        loadingQuestions: loadingQuestions,
        userQuestions: userQuestions,
        exitMenu: exitMenu(),
        refreshUser: refreshUser,
        onUserClick: onUserClick,
        deleteUser: deleteUser,
        onLogin: onLogin,
        fetchUser: getUserQuestions,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
