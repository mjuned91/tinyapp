const express = require("express");
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

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.post("/urls", (req, res) => {
  //console.log(req.body); // Log the POST request body to the console
  const {longURL} = req.body; // Destructuring (its a way of writing it)
  if (!longURL) {
    return res.send("You need to pass a longURL.");
  };
  // To add the newly generated id-longURL to the database
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

// To get redirected to the longURL directly
app.get("/u/:id", (req, res) => {
  const {id} = req.params;
  if (!urlDatabase[id]) {
    return res.send("This short URL does not exist.");
  } else {
    const longURL = urlDatabase[id];
    res.redirect(longURL);
  };
});

// To delete a URL
app.post("/urls/:id/delete", (req, res) => {
  const {id} = req.params;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// To redirect the Edit button
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  console.log("hello");
  res.redirect(`/urls/${shortURL}`);
});

// Get longURL from the req and update it to the database
app.post("/urls/:id/edit", (req, res) => {
  console.log(req);
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const {id} = req.params;
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
