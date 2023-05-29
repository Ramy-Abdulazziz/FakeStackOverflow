import { createContext } from "react";

const QuestionContext = createContext({
  userQuestions: [],
  allQuestions: [],
  displayedQuestions: [],
  detailedQuestion: [],
  fetchAll: () => {},
  fetchUser: () => {},
  //   onAdd: () => {},
  //   onDelete: () => {},
  onSort: () => {},
  onSearch: () => {},
  onInputChange: () => {},
  loadingQuestions: false,
  questionContext: () => {},
  handleUpvote: () => {},
  handleDownvote: () => {},
  handleQuestionClick: () => {},
});

export default QuestionContext;
