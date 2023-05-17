import { createContext } from "react";

const AuthContext = createContext({
  isLoggedIn: false,
  userName: null,
  userId: null,
  userRole: null,
  onLogin: () => {},
  onLogout: () => {},
});
export default AuthContext;
