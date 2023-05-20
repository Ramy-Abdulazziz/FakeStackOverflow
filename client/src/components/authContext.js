import { createContext } from "react";

const AuthContext = createContext({
  isLoggedIn: false,
  userName: null,
  userId: null,
  userRole: null,
  allQuestions: [],
  onLogin: () => {},
  onLogout: () => {},
});
export default AuthContext;
