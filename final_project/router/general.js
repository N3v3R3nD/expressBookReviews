const express = require('express');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(400).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
// Get the book list available in the shop
public_users.get('/', function (req, res) {
  const bookListPromise = new Promise((resolve, reject) => {
    const bookList = Object.values(books).map((book) => ({
      title: book.title,
      author: book.author,
    }));
    resolve(bookList);
  });

  bookListPromise.then(bookList => {
    return res.status(200).json({
      message: "List of books available in the shop",
      books: bookList,
    });
  }).catch(error => {
    return res.status(500).json({
      message: "Error occurred while getting book list",
      error: error,
    });
  });
});

public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const bookPromise = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  });

  bookPromise.then(book => {
    return res.status(200).json({ book });
  }).catch(error => {
    return res.status(404).json({ message: error });
  });
});

public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const filteredBooksPromise = new Promise((resolve, reject) => {
    const filteredBooks = Object.values(books).filter(book => book.author === author);
    resolve(filteredBooks);
  });

  filteredBooksPromise.then(filteredBooks => {
    return res.status(200).json({ books: filteredBooks });
  }).catch(error => {
    return res.status(500).json({
      message: "Error occurred while getting books",
      error: error,
    });
  });
});

public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const filteredBooksPromise = new Promise((resolve, reject) => {
    const filteredBooks = Object.values(books).filter(book => book.title === title);
    resolve(filteredBooks);
  });

  filteredBooksPromise.then(filteredBooks => {
    return res.status(200).json({ books: filteredBooks });
  }).catch(error => {
    return res.status(500).json({
      message: "Error occurred while getting books",
      error: error,
    });
  });
});

public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const bookPromise = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book.reviews);
    } else {
      reject("Book not found");
    }
  });

  bookPromise.then(reviews => {
    return res.status(200).json({ reviews });
  }).catch(error => {
    return res.status(404).json({ message: error });
  });
});


module.exports.general = public_users;
