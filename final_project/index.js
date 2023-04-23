const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use(session({secret: "fingerprint_customer", resave: true, saveUninitialized: true}));

const PORT = 5000;

app.use("/", customer_routes); // Use the root path for customer_routes
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
