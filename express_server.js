const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { generateRandomString, getUserByEmail, urlsForUser } = require("./helpers");
const app = express();
const PORT = 8080;

const urlDatabase = {};
const users = {};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({name: 'session', keys: ["sheeshkabab"], maxAge: 24 * 60 * 60 * 1000}));



// Page - /urls
app.get("/urls", (req, res) => {
  const userID = req.session.userID; 
  if (!userID) {
    return res.send("You must be logged in to view the URLs.");
  };

  const userURLs = urlsForUser(userID, urlDatabase);
  const user = users[userID];
  const templateVars = { urls: userURLs, user };
  res.render("urls_index", templateVars);
  });

// Page - /register
app.get("/register", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    return res.redirect("/urls");
  };
  const user = users[userID];
  const templateVars = { user };
  res.render("urls_register", templateVars);
});

// Page - /login
app.get("/login", (req, res) => {
  const userID = req.session.userID; 
  if (userID) {
    return res.redirect("/urls"); 
  };

  const user = users[userID];
  const templateVars = { user };
  res.render("urls_login", templateVars);
});

// Page - /urls/new
app.get("/urls/new", (req, res) => {
  const userID = req.session.userID; 
  if (!userID) {
    return res.redirect("/login");
  };

  const user = users[userID];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

// To get redirected to the longURL directly
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.send("Sorry. This shortURL does not exist.");
  };

  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

// Page - to edit the longURL
app.get("/urls/:id", (req, res) => {
  const userID = req.session.userID;; 
  if (!userID) {
    return res.send("You must be logged in to view the URLs.");
  };

  const id = req.params.id;
  if (userID !== urlDatabase[id].userID) {
    return res.send("You do not have this shortURL saved.");
  }; 

  const user = users[userID];
  const longURL = urlDatabase[id].longURL;
  const templateVars = { id, longURL, user };
  res.render("urls_show", templateVars);
});


// To add the newly generated id-longURL pair to the database
app.post("/urls", (req, res) => {
  const userID = req.session.userID; 
  if (!userID) {
    return res.send("You must be logged in to shorten the URL.");
  };
  const longURL = req.body.longURL;
  if (!longURL) {
    return res.send("Please provide a proper URL.");
  };
  // Where id is the shortURL
  const id = generateRandomString();
  urlDatabase[id]= {
    longURL: longURL,
    userID: userID
  };
  res.redirect(`/urls/${id}`);
});

// To delete a URL
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.userID;
  const id = req.params.id;
  if (!userID) {
    return res.send("You must be logged in to shorten the URL.");
  } else if (userID !== urlDatabase[id].userID) {
    return res.send("Request denied. You are not allowed to delete that shortURL.");
  } else if (!urlDatabase[id]) {
    return res.send("Sorry. This short URL does not exist.");
  };
  
  delete urlDatabase[id];
  res.redirect("/urls");
});

// To redirect the Edit button
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  res.redirect(`/urls/${id}`);
});

// Get longURL from the req and update it on the database
app.post("/urls/:id/edit", (req, res) => {
  const userID = req.session.userID; 
  if (!userID) {
    return res.send("You must be logged in to shorten the URL.");
  };
  
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id].longURL = longURL;
  res.redirect("/urls");
});

// Register
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  if (!userEmail || !userPassword) {
    res.status(400).send("The email address or password field is empty. Please fill out both fields.");
  } else if (getUserByEmail(userEmail, users)) {
    res.status(400).send("This email address already exists. Please enter a new email address.");
  } else if (userPassword.length < 6) {
    return res.status(400).send("Please enter a password with a minimum of 6 characters.");
  } else {
    users[userID] = {
      id: userID,
      email: userEmail,
      password: bcrypt.hashSync(userPassword, 10)
    };
  };

  req.session.userID = userID;
  res.redirect("/urls");
});

// Login cookie
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const user = getUserByEmail(userEmail, users);
  const userID = user.id;
  if (!userEmail || !userPassword) {
    return res.status(403).send("The email address or password field is empty. Please fill out both fields.");
  } else if (!userID) {
    return res.status(403).send("No existing user was found with this email address. Please try again.");
  } else if (userID && !bcrypt.compareSync(userPassword, user.password)) { 
    return res.status(403).send("Wrong password. Please try again.");
  } else if (userID && bcrypt.compareSync(userPassword, user.password)) {
    req.session.userID = userID;
  };
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
