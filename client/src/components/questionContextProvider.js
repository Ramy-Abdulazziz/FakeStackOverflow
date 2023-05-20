import { useState, useContext } from "react";
import AuthContext from "./authContext";
import QuestionContext from "./questionContext";
import axios from "axios";

export default function QuestionContextProvider({ children }) {
  const [allQuestions, setAllQuestions] = useState([]);
  const [userQuestions, setUserQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const authContext = useContext(AuthContext);

  const handleSort = async (params) => {
    try {
      const response = await axios.get("http://localhost:8000/questions", {
        params: params,
      });

      setAllQuestions(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const questions = await axios.get("http://localhost:8000/questions");
      console.log("response", questions.data);

      setAllQuestions(
        questions.data.sort(
          (a, b) => new Date(b.ask_date) - new Date(a.ask_date)
        )
      );
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchAllUserQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const response = await axios.get(
        `http://localhost:8000/questions/user/${authContext.userId}`
      );
      setUserQuestions(
        response.data.sort(
          (a, b) => new Date(b.ask_date) - new Date(a.ask_date)
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };
  return (
    <QuestionContext.Provider
      value={{
        allQuestions: allQuestions,
        userQuestions: userQuestions,
        fetchAll: fetchAllQuestions,
        fetchUser: fetchAllUserQuestions,
        onSort: handleSort,
        loadingQuestions: loadingQuestions,
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
}
