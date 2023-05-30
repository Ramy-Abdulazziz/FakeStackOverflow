import { useState, useContext, useEffect } from "react";
import AuthContext from "./authContext";
import QuestionContext from "./questionContext";
import axios from "axios";

export default function QuestionContextProvider({ children }) {
  const [allQuestions, setAllQuestions] = useState([]);
  const [userQuestions, setUserQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [displayedQuestions, setDisplayedQuestions] = useState([]);
  const [searchText, setSearchTerm] = useState("");
  const [detailedQuestion, setDetailedQuestion] = useState(null);
  const [userAnswered, setUserAnswered] = useState([]);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchAllQuestions();
  }, []);
  const handleSort = async (params) => {
    try {
      setLoadingQuestions(true);
      const response = await axios.get("http://localhost:8000/questions", {
        params: params,
      });
      setDisplayedQuestions(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchAllQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const questions = await axios.get("http://localhost:8000/questions");
      console.log("response", questions.data);
      setAllQuestions(questions.data);

      setDisplayedQuestions(
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
      console.log(authContext.userId);
      const response = await axios.get(
        `http://localhost:8000/questions/user/${authContext.user._id}`
      );
      console.log(response);
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

  const fetchAllUserAnsweredQuestions = async () => {
    try {
      setLoadingQuestions(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };
  const extractTextSearchString = (searchText) => {
    let regex = new RegExp("\\[\\D+\\]", "g");
    let extracted = searchText.replace(regex, "");

    return extracted.toLowerCase().trim();
  };

  const splitTextIntoWordArray = (textString) => {
    return textString.split(new RegExp("[\\s]+", "g"));
  };

  const sanitizeSearchTags = (searchString) => {
    let sanitizedArray = [];

    let regexBrackets = new RegExp("[[\\]]", "g");
    let regexWhiteSpace = new RegExp("[\\s]", "g");
    let sanitized = searchString
      .toLowerCase()
      .replace(regexWhiteSpace, "")
      .split(regexBrackets);

    sanitized.forEach((term) => {
      term === "" ? (term = "") : sanitizedArray.push(term);
    });

    return sanitizedArray;
  };
  const search = async (searchText, searchBy) => {
    try {
      const response = await axios.get("http://localhost:8000/search", {
        params: { text: searchText, by: searchBy },
      });

      return response.data;
    } catch (error) {
      console.error("Error searching questions:", error);
      return [];
    }
  };

  const handleInputChange = async (event) => {
    setSearchTerm(event.target.value);
  };
  const handleSearch = async (event, searchQuery) => {
    try {
      if (event.key === "Enter") {
        let searchQuery = searchText;
        let searchTerm = searchQuery.trim();

        if (searchTerm === "") {
          setDisplayedQuestions([]);
          event.target.value = "";
          event.target.blur();
          return;
        }

        let searchRegex = new RegExp("\\[[a-zA-Z0-9-]+\\]", "g");
        let tags = searchTerm.match(searchRegex);

        let nonTags = extractTextSearchString(searchTerm);
        nonTags = splitTextIntoWordArray(nonTags);

        let sanitizedTags =
          tags == null ? [] : tags.map((tag) => sanitizeSearchTags(tag)).flat();

        const tagMatches = await Promise.all(
          sanitizedTags.map(async (tag) => {
            return await search(tag, "tags");
          })
        );

        const nonTagMatches = await Promise.all(
          nonTags.map(async (term) => {
            return await search(term, "text_and_title");
          })
        );

        const linkMatches = await Promise.all(
          nonTags.map(async (term) => {
            return await search(term, "links");
          })
        );

        let matchingQuestions = [
          ...tagMatches.flat(),
          ...nonTagMatches.flat(),
          ...linkMatches.flat(),
        ];

        let uniqueQuestionsMap = new Map();

        matchingQuestions.forEach((q) => {
          uniqueQuestionsMap.set(q._id, q);
        });

        let uniqueQuestions = Array.from(uniqueQuestionsMap.values());
        setDisplayedQuestions(uniqueQuestions);
        event.target.value = "";
        event.target.blur();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTagClick = async (questions) => {
    setDisplayedQuestions(questions.tagQuestions);
  };

  const handleUpvote = async (question) => {
    try {
      await axios.put(`http://localhost:8000/question/${question._id}/upvote`);

      await axios.put(
        `http://localhost:8000/user/${question.asked_by._id}/increase/${5}`
      );

      await fetchAllQuestions();
      await handleQuestionClick(question._id);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDownVote = async (question) => {
    try {
      await axios.put(
        `http://localhost:8000/question/${question._id}/downvote`
      );

      await axios.put(
        `http://localhost:8000/user/${question.asked_by._id}/decrease/${10}`
      );

      await fetchAllQuestions();
      await handleQuestionClick(question._id);
    } catch (err) {
      console.log(err);
    }
  };

  const handleQuestionClick = async (id) => {
    try {
      const question = await axios.get(
        `http://localhost:8000/questions?id=${id}`
      );
      setDetailedQuestion(question);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddQuestion = async (data) => {
    const url = "http://localhost:8000/submit/question";

    await axios
      .post(url, data)
      .then((response) => {
        console.log(response);
        fetchAllQuestions(); 
        fetchAllUserQuestions(); 
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <QuestionContext.Provider
      value={{
        allQuestions: allQuestions,
        userQuestions: userQuestions,
        displayedQuestions: displayedQuestions,
        loadingQuestions: loadingQuestions,
        detailedQuestion: detailedQuestion,
        fetchAll: fetchAllQuestions,
        fetchUser: fetchAllUserQuestions,
        onSort: handleSort,
        onSearch: handleSearch,
        onInputChange: handleInputChange,
        handleTagClick: handleTagClick,
        handleUpvote: handleUpvote,
        handleDownvote: handleDownVote,
        handleQuestionClick: handleQuestionClick,
        handleAdd: handleAddQuestion,
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
}
