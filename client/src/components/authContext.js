import { createContext } from "react";

const AuthContext = createContext({
  isLoggedIn: false,
  userName: null,
  userId: null,
  userRole: null,
  allQuestions: [],
  signUp: null,
  onLogin: () => {},
  onLogout: () => {},
  isLoading: false,
  user: null,
  reputation: 0,
  refreshUserInfo: () => {},
});
export default AuthContext;
