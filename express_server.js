const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");


// middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


// Database
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Create
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortLink = req.params.shortURL
  const templateVars = { user: users[user_id], shortURL: shortLink, longURL: urlDatabase[shortLink]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});
app.get("/urls", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = {  user: users[user_id], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.post("/urls", (req, res) => {
  const longUrl = req.body.longURL;
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = longUrl;
  res.redirect("/urls");         
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortUrl = req.params.shortURL;
  delete urlDatabase[shortUrl]
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortUrl = req.params.shortURL;
  res.redirect(`/urls/${shortUrl}`);
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortUrl = req.params.shortURL;
  const newurl = req.body.newurl;
  urlDatabase[shortUrl] = newurl;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  console.log(username);
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = { user: users[user_id] }
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    res.status('400');
    res.send('Email or password is incorrect');
  } else if (emailTaken(users, req.body.email)) {
    res.status('400');
    res.send('Email already in use');
  } else {
    users[user_id] = { user_id: user_id, email: req.body.email, password: req.body.password };
    res.cookie("user_id", user_id);
    res.redirect("/urls");
  }
     
});


app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random().toString(36).slice(-6)
};

function emailTaken (users, email) {
  for (let id in users) {
    console.log('users id email', users[id].email);
      console.log('email', email);
    if (users[id].email === email) {
      
      console.log('email already taken');
      return true;
    }
  }
  return false;
};

