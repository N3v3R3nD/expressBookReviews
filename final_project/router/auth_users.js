const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

const authenticate = (req, res, next) => {
  const token = req.session.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(token, '1234567890', (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = user;
    next();
  });
};

regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log("Received data from POST request:", req.body);

  if (!username || !password) {
    console.log("Missing username or password:", { username, password });
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const token = jwt.sign({ username }, "1234567890", { expiresIn: "1h" });
  req.session.token = token;
  return res.status(200).json({ message: "Logged in successfully", token }); // Ensure that the response JSON contains a success message and a token
});


regd_users.put("/auth/review/:isbn", authenticate, (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  console.log(`ISBN: ${isbn}`);
  console.log(`Review: ${review}`);

  if (!books.hasOwnProperty(isbn)) {
    return res.status(404).json({ message: "Book not found" });
  }

  const username = req.user.username;
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully" });
});


regd_users.delete("/auth/review/:isbn", authenticate, (req, res) => {
  const isbn = req.params.isbn;

  if (!books.hasOwnProperty(isbn)) {
    return res.status(404).json({ message: "Book not found" });
  }

  const username = req.user.username;

  if (!books[isbn].reviews.hasOwnProperty(username)) {
    return res.status(404).json({ message: "Review not found" });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.users = users;
