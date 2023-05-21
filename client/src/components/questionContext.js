import { createContext } from "react";

const QuestionContext = createContext({
  userQuestions: [],
  allQuestions: [],
  displayedQuestions: [],
  fetchAll: () => {},
  fetchUser: () => {},
  //   onAdd: () => {},
  //   onDelete: () => {},
  onSort: () => {},
  onSearch: () => {},
  onInputChange:()=> {},
  loadingQuestions: false,
});

export default QuestionContext;
