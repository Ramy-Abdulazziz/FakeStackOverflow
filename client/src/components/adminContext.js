import { createContext } from "react";

const AdminContext = createContext({
  userId: "",
  handlingUser: "",
  handlingUsername: "",
  handlingUserID: null,
  onLogin: () => {},
  showAdminOption: false, 
  loadingQuestions: false, 
  userQuestions: [], 
  onUserClick: () => {},
  deleteUser: () => {},
  exitMenu: () => {}, 
  refreshUser : () => {}, 
  fetchUser: () => {}, 
});

export default AdminContext;
