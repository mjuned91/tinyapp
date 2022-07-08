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

const urlsForUser = (id, database) => {
  let userURLs = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      userURLs[shortURL] = database[shortURL];
    };
  };
  return userURLs;
};

const urlDatabase = {
  "b6UTxQ": {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  "i3BoGr": {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  }
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

// Page - /urls
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_ID"]; 
  if (!userID) {
    return res.send("You must be logged in to view the shortened URLs.");
  };

  const userURLs = urlsForUser(userID, urlDatabase);
  const user = users[req.cookies["user_ID"]];
  const templateVars = { urls: userURLs, user };
  res.render("urls_index", templateVars);
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
  const userID = req.cookies["user_ID"]; 
  if (!userID) {
    return res.send("You must be logged in to view the shortened URLs.");
  };

  const id = req.params.id;
  if (userID !== urlDatabase[id].userID) {
    return res.send("You do not have this short URL saved.");
  }; 

  const user = users[req.cookies["user_ID"]];
  const longURL = urlDatabase[id].longURL;
  const templateVars = { id, longURL, user };
  res.render("urls_show", templateVars);
});


// To add the newly generated id-longURL pair to the database
app.post("/urls", (req, res) => {
  const userID = req.cookies["user_ID"]; 
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
  const userID = req.cookies["user_ID"];
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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
