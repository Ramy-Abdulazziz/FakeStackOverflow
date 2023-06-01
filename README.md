[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/yUJWOw2_)
Read the Project Specfications [here](https://docs.google.com/document/d/1zZjNk9cbNLz0mp_-YtyZxhMzUph97fVgCkSE4u2k5EA/edit?usp=sharing).

Add design docs in *images/*

## Instructions to setup and run project

## Dependancies 

The following dependancies are nececarry to run this application: 

### Client:
```
@emotion/react
@emotion/styled
@hookform/resolvers
@mui/icons-material
@mui/material
axios
material-icons
moment
react
react-dom
react-hook-form
react-icons
react-router
react-router-dom
react-scripts
yup
```

### Server:
```
bcrypt
bcryptjs
connect-mongodb-session
cookie-parser
cors
express
express-session
mongoose
mysql
nodemon
```

## Setup and Structure

After setting up your project structure, with seperate folders for both the client and server, be sure to install all nececarry dependancies using npm.

### Client

The front end of the application is developed using the React framework, with the included libraries. The client runs on the default port: 

```
http://localhost:3000
```
The [mui](https://mui.com) library was used primary to develop the front end UI, with provided React components. The components were adjusted using a combination of CSS and the provided system prop: 

```
sx={{...}}
```

React Router is used primaraly as a means of navigation within the application - allowing components to be reused across seperate pages. The libray also allows for the use of paramaters passed within the URL into components: 

```
const { id } = useParam(); 
```

The application component holds the nececarry information for all routes: 

```
<AuthContextProvider>
      <AdminContextProvider>
        <QuestionContextProvider>
          <ThemeProvider theme={darkTheme}>
            <Router>
              <Header />
              <Box sx={{ maxHeight: "100%", maxWidth: 1800 }}>
                <Container sx={{ maxWidth: 1800 }}>
                  <Routes>
                    <Route path="/" element={<LoginModal />} />
                    <Route path="/sign-up" element={<SignUpModal />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/all-tags" element={<TagPage />} />
                    <Route
                      path="/answers/:id"
                      element={<DetailedQuestionPage />}
                    />
                    <Route path="/user/:id" element={<UserProfile />} />
                    <Route
                      path="/user/:id/questions"
                      element={<UserAnsweredPage />}
                    />

                    ...

                    <Route path='*' element={<ErrorPage />} />
                  </Routes>
                </Container>
              </Box>
            </Router>
          </ThemeProvider>
        </QuestionContextProvider>
      </AdminContextProvider>
    </AuthContextProvider>
```

As shown, React Context are used as a means of avoiding unnecarry prop drilling and maintaining a sort of global state within the application. Different context are created for use within the application including user authentication, admin privledges, and question / answer interaction. 

### Server

The backend of the application is built on a Node.js and Express.js server, utilizing MongoDB as its primary database for data storage and retrieval.

Express is used as the server framework due to its flexibility and ease of use, providing a simple way to define routes and middleware. The cors package is used to enable Cross-Origin Resource Sharing (CORS), allowing the server to handle requests from different origins. This is particularly useful if your frontend and backend are hosted on different domains or ports. In this case, the server is set up to accept requests from http://localhost:3000.

### User Ssessions
For user sessions, express-session is used, which provides an API for handling session data in Express apps. User sessions are stored using connect-mongodb-session, a MongoDB-backed session store. This allows us to store session data in MongoDB, providing a more scalable and robust solution for managing session data compared to storing sessions in memory.

### Backend
The backend uses Mongoose, an Object Data Modeling (ODM) library for MongoDB and Node.js. Mongoose helps manage relationships between data, provides schema validation, and is used to translate between objects in code and the representation of those objects in MongoDB.

The server connects to a local MongoDB instance at mongodb://127.0.0.1:27017/fake_so. In case of any connection errors, these are logged to the console. Upon successful connection, a confirmation message is logged.

The application includes several models, including Question, Answer, Tag, User, and Comment. These models define the structure of the corresponding collections in the MongoDB database.

A middleware function is also set up for authentication, utilizing the session storage created earlier. The secret key for the session is stored as a string, but in a production environment, this should be stored securely and not exposed in the code.

The server listens on port 8000, ready to accept incoming requests and respond with the appropriate data.


### Running The Server
To run the server, ensure that Node.js and MongoDB are installed on your machine, then navigate to the directory containing the server files and run the command nodemon. If successful, you should see the message "Connected to database" in your terminal.
## Team Member 1 Contribution

Solo Project - All work

## Team Member 2 Contribution
