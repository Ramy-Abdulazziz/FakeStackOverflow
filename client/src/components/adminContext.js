import { createContext } from "react";

const AdminContext = createContext({
  userId: "",
  handlingUser: "",
  handlingUsername: "",
  handlingUserID: null,
  onLogin: () => {},
  onUserClick: () => {},
  deleteUser: () => {},
});

export default AdminContext;
