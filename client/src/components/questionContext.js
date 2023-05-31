import { createContext } from "react";

const QuestionContext = createContext({
  userQuestions: [],
  allQuestions: [],
  displayedQuestions: [],
  detailedQuestion: [],
  userAnswered: [],
  fetchAll: () => {},
  fetchUser: () => {},
  handleAdd: () => {},
  //   onDelete: () => {},
  onSort: () => {},
  onSearch: () => {},
  onInputChange: () => {},
  loadingQuestions: false,
  questionContext: () => {},
  handleUpvote: () => {},
  handleDownvote: () => {},
  handleQuestionClick: () => {},
  handleAsnwer: () => {},
});

export default QuestionContext;
