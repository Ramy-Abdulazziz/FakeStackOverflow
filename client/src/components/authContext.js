import { createContext } from "react";

const AuthContext = createContext({
  isLoggedIn: false,
  userName: null,
  userId: null,
  userRole: null,
  allQuestions: [],
  onLogin: () => {},
  onLogout: () => {},
  isLoading: false,
  user: null,
  reputation: 0,
});
export default AuthContext;
