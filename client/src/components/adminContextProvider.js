import { useState, useEffect, useContext } from "react";
import AuthContext from "./authContext";
import axios from "axios";
import QuestionContext from "./questionContext";
import AdminContext from "./adminContext";

export default function AdminContextProvider({ children }) {
  const [handlingUserID, setHandlingUserID] = useState("");
  const [handlingUsername, setHandlingUserName] = useState("");
  const [handlingUser, setHandlingUser] = useState(null);
  const [userId, setUserId] = useState("");
  const [showAdminOption, setShowAdminOptions] = useState(false);
  const authContext = useContext(AuthContext);

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

  return (
    <AdminContext.Provider
      value={{
        userId: userId,
        handlingUser: handlingUser,
        handlingUsername: handlingUsername,
        handlingUserID: handlingUserID,
        showAdminOption: showAdminOption,
        onUserClick: onUserClick,
        deleteUser: deleteUser,
        onLogin: onLogin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
