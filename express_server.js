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
    password: "aaa",
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "ddd"
  }
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

//Create
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id]
  if(!user) {
    res.redirect("/login");
    return;
  }
  const templateVars = { user: user }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies.user_id;
  const shortUrl = req.params.shortURL
  console.log("shortUrl: ", shortUrl);
  console.log("urldatabase: ", urlDatabase);
  console.log(urlDatabase[shortUrl]);
  const templateVars = { user: users[user_id], shortURL: shortUrl, longURL: urlDatabase[shortUrl].longURL};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
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
  const user_id = req.cookies.user_id;
  const user = users[user_id]
  if(!user) {
    res.send("Error you are not logged in");
    return;
  }
  const longUrl = req.body.longURL;
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = { longURL: longUrl, userID: user_id };
  res.redirect("/urls");         
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortUrl = req.params.shortURL;
  delete urlDatabase[shortUrl]
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortUrl = req.params.shortURL;
  const newurl = req.body.newurl;
  urlDatabase[shortUrl]['longURL'] = newurl;
  res.redirect(`/urls`);
});


app.get("/register", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = { user: users[user_id] }
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  console.log('req.params:', req.params);
  const user_id = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    res.status('400');
    res.send('Email or password is incorrect');
  } else if (findUserByEmail(users, req.body.email)) {
    res.status('400');
    res.send('Email already in use');
  } else {
    users[user_id] = { id: user_id, email: req.body.email, password: req.body.password };
    console.log(users);
    res.cookie("user_id", user_id);
    res.redirect("/urls");
  }
     
});

app.get("/login", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = { user: users[user_id] };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const user = findUserByEmail(users, req.body.email);
  console.log('req.body:', req.body);
  console.log('user', user);
  if (!user) {
    res.status('403');
    res.send('Email not found');
    return;
  }
  if (user.password === req.body.password) {
   
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status('403');
    res.send('Incorrect password');
  };
  
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random().toString(36).slice(-6)
};

function findUserByEmail (users, email) {
  for (let id in users) {
    console.log('users id email', users[id].email);
      console.log('email', email);
    if (users[id].email === email) {
      
      console.log('email already taken');
      return users[id];
    }
  }
  return undefined;
};

