Add data model figures in this directory.
```
classDiagram
  class User {
    user_name: String
    email: String
    questions: Question[]
    answers: Answer[]
    tags: Tag[]
    reputation: Number
    sign_up_date: Date
    admin: Boolean
    password: String
    comments: Comment[]
  }
  class Tag {
    name: String
    created_by: User
    used_by: User[]
  }
  class Question {
    title: String
    text: String
    summary: String
    tags: Tag[]
    answers: Answer[]
    comments: Comment[]
    asked_by: User
    ask_date: Date
    views: Number
    upvotes: Number
  }
  class Answer {
    text: String
    ans_by: User
    comments: Comment[]
    ans_date_time: Date
    question: Question
    upvotes: Number
  }
  class Comment {
    text: String
    created_by: User
    date_created: Date
    parent: Question | Answer
    parentType: String
    upvotes: Number
  }
  User "1" -- "*" Question: asks
  User "1" -- "*" Answer: answers
  User "1" -- "*" Comment: comments
  User "1" -- "*" Tag: creates
  Question "1" -- "*" Answer: has
  Question "1" -- "*" Comment: has
  Answer "1" -- "*" Comment: has
  Tag "1" -- "*" Question: tags
  User --|> Question: edits
  User --|> Answer: edits
  User --|> Comment: edits
  User --|> Tag: edits
  User --|> User: deletes
  User --|> Question: deletes
  User --|> Answer: deletes
  User --|> Comment: deletes
  User --|> Tag: deletes
  User --|> Question: upvotes
  User --|> Answer: upvotes
  User --|> Comment: upvotes

```  