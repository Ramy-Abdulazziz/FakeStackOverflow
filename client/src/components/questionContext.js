import { createContext } from "react";

const QuestionContext = createContext({
  userQuestions: [],
  allQuestions: [],
  fetchAll: () => {},
  fetchUser: () => {},
  //   onAdd: () => {},
  //   onDelete: () => {},
  onSort: () => {},
  loadingQuestions: false,
});

export default QuestionContext;
