const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

const generateRandomString = () => {
  const alphaNumerical = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += alphaNumerical.charAt(Math.floor(Math.random() * alphaNumerical.length));
  }
  return result;
};

const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    };
  };
  return undefined;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// To add the newly generated id-longURL to the database
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  if (!longURL) {
    return res.send("Please provide a proper URL.");
  };

  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

// To get redirected to the longURL directly
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.send("This short URL does not exist.");
  } else {
    const longURL = urlDatabase[id];
    res.redirect(longURL);
  };
});

// To delete a URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// To redirect the Edit button
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  res.redirect(`/urls/${shortURL}`);
});

// Get longURL from the req and update it to the database
app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

// Login cookie
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userID = getUserByEmail(userEmail, users);
  if (!userEmail || !userPassword) {
    return res.status(403).send("The email address or password field is empty. Please fill out both fields.");
  } else if (!userID) {
    return res.status(403).send("No existing user was found with this email address. Please try again.");
  } else if (userID && (userPassword !== userID.password)) { 
    return res.status(403).send("Wrong password. Please try again.");
  } else if (userID) {
    res.cookie("user_ID", userID.id);
  };
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_ID");
  res.redirect("/login");
});

// Register
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const user = users[req.cookies["user_ID"]];
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
      password: userPassword
    };
  };
  res.cookie("user_ID", userID);
  res.redirect("/urls");
});

// Page - /register
app.get("/register", (req, res) => {
    const user = users[req.cookies["user_ID"]];
    const templateVars = { user };
    res.render("urls_register", templateVars);
});

// Page - /login
app.get("/login", (req, res) => {
  const userID = req.cookies["user_ID"]; 
  if (userID) {
    return res.redirect("/urls"); 
  };
  const user = users[req.cookies["user_ID"]];
  const templateVars = { user };
  res.render("urls_login", templateVars);
});

// Page - /urls
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_ID"]];
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});

// Page - /urls/new
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_ID"]; 
  if (!userID) {
    return res.redirect("/login");
  };
  const user = users[req.cookies["user_ID"]];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

// Page - to edit the longURL
app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_ID"]];
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL, user };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
