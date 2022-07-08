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
    return res.send("You need to pass a longURL.");
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
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// Register
app.post("/register", (req, res) => {
  
});

// Page - /register
app.get("/register", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = { username };
res.render("urls_register", templateVars);
});

// Page - /login
app.get("/login", (req, res) => {
  res.render("urls_login", {});
});

// Page - /urls
app.get("/urls", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = { urls: urlDatabase, username };
  res.render("urls_index", templateVars);
});

// Page - /urls/new
app.get("/urls/new", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = { username };
  res.render("urls_new", templateVars);
});

// Page - to edit the longURL
app.get("/urls/:id", (req, res) => {
  const username = req.cookies["username"];
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL, username };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
