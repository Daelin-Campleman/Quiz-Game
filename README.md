# Quiz Game :pencil2:

| Links |
|-|
| [GitHub Repo](https://github.com/Daelin-Campleman/Quiz-Game/) |
| [Trello Board](https://trello.com/b/oyYSQltB/quiz-game) ([Invite](https://trello.com/invite/b/oyYSQltB/ATTIb28d46f87b502d79c5f2c283e844894d51B711F6/quiz-game)) |
| [Figma Design](https://www.figma.com/file/3oNCVXMz1rWdABBy9FtHU1/Quiz-Game?node-id=0%3A1&t=oQv0QR0euSrOy0UZ-1) |
| QA - [https://quizwizzyzilla-qa.azurewebsites.net](https://quizwizzyzilla-qa.azurewebsites.net) |
| Prod - [https://quizwizzyzilla.azurewebsites.net](https://quizwizzyzilla.azurewebsites.net) |

## Overview

This website will allow users to take quizes with their friends (kinda like running your own quiz night). General knowledge multiple choice questions will be shows to all users who have joined a specific quiz. Participants will receive points for correct answers and a leaderboard will show who is doing best.

When a user creates a quiz, they will be given a join code that they can share with anyone else who wants to join that quiz. The person who creates the quiz will be able to change certain parts of the quiz such as the number of rounds, number of questions per round, and whether or not there is a time limit for each question.

Questions will be retrieved from an API (e.g. [The Trivia API](https://the-trivia-api.com/))

A database will be used to store all the questions that are asked in a quiz so that players can go back and see what they got wrong and the correct answers. Players' scores will also be stored in the database.

The application will use it's own API in order to communicate with the database.

[Express](https://expressjs.com/) and [Socket.io](https://socket.io/) will be used to serve the webpage and manage communication between players and the server.

## Requirements
- Html, CSS, and JS only.
- Multiple pages
- Enough scope to flex your new muscles
- No front end framework
- Node.JS for the back
- Relational DB of choice
- Express is allowed but, you should be able to tell us why you needed express or any other library.
- Your web application and backend have to be deployed live at a secure web-address(HTTPS).
- Your web-application will make use of APIs (both an API you built as well as an API you did not build – 3rd party)
- Your database will be deployed and secured live.
- NO localhost allowed! 

## Other headings...


## Team Members

| Name             | Email Address              |
|------------------|----------------------------|
| Daelin Campleman | daelin.campleman@bbd.co.za |
| Johan Smit       | johansm@bbd.co.za          |
| Reece Stephenson | reeces@bbd.co.za           |
| Matthew Dacre    | matthewd@bbd.co.za         |
| Thomas Stevens   | thomas@bbd.co.za           |
