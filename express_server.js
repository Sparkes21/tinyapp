//Include Modules
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const helpers = require("./helpers");

//Set our PORT
const PORT = 8080; 


//Set EJS as the view engine for app
app.set("view engine", "ejs");



// middleware
app.use(cookieSession({
  name: 'session',
  keys: ['any', 'string'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 
}))

app.use(bodyParser.urlencoded({extended: true}));



// Databases
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

// get request for main page that redirects to login or urls if already logged in
app.get('/', (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
  
});

// page displaying urls associated with user
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status('401').send('Error, log in required to view this page <a href="/login">login</a>');
  };
  const user_id = req.session.user_id;
  const userURLS = urlsForUser(user_id);
  const templateVars = {  user: users[user_id], urls: userURLS };
  res.render("urls_index", templateVars);
});

//takes you to page to create new shortURL
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id]
  if(!user) {
    res.redirect("/login");
    return;
  }
  const templateVars = { user: user }
  res.render("urls_new", templateVars);
});
//page associated with specific shortURL and has the ability to change it 
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    return res.status('401').send('Error, log in required to view this page <a href="/login">login</a>');
  };
  const user_id = req.session.user_id;
  const shortUrl = req.params.shortURL
  const userURLS = urlsForUser(user_id);
   if (!Object.keys(userURLS).includes(shortUrl)) {
     return res.status('401').send('Error, this shortUrl does not belong to you');
   };
  const templateVars = { user: users[user_id], shortURL: shortUrl, longURL: urlDatabase[shortUrl].longURL};
  res.render("urls_show", templateVars);
});

// takes you to page associated with specific shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

// lets you create short urls for a longURL and associates it to your id
app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
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


// deletes a url if logged in and url exists attached to your username, wont let you view it if not logged in 
app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.session.user_id;
  const shortUrl = req.params.shortURL;
  if (!urlDatabase[shortUrl]) {
    return res.status('404').send('shortUrl does not exist');
  };

  if (urlDatabase[shortUrl].userID === user_id) {
    delete urlDatabase[shortUrl];
    return res.redirect("/urls");
  };

  if (!user_id) {
    return res.status('401').send('Please login to view shortURl <a href="/login">login</a>');
  }
  
});

// edit url function to change shortUrl to a new longUrl 
app.post("/urls/:shortURL/edit", (req, res) => {
  const user_id = req.session.user_id;
  const shortUrl = req.params.shortURL;
  const newurl = req.body.newurl;
  if (!urlDatabase[shortUrl]) {
    return res.status('404').send('shortUrl does not exist');
  }
  if (!user_id) {

    return res.status('401').send('Please login to view shortURl <a href="/login">login</a>');
  }

   if (urlDatabase[shortUrl].userID === user_id) {
    urlDatabase[shortUrl]['longURL'] = newurl;
    return res.redirect(`/urls`);
  }
 
});

//login page 
app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = { user: users[user_id] };
  res.render("login", templateVars);
});

// registration page 
app.get("/register", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = { user: users[user_id] }
  res.render("registration", templateVars);
});
//checks if username and password exist and then logs you in if they both are correct, otherwise sends error
app.post("/login", (req, res) => {
  const user = helpers.findUserByEmail(users, req.body.email);
  if (!user) {
    res.status('403');
    res.send('Email not found');
    return;
  }
  if (bcrypt.compareSync(req.body.password , user.password)) {
    req.session["user_id"] = user.id;
    res.redirect("/urls");
  } else {
    res.status('403');
    res.send('Incorrect password');
  };
  
});

//lets you register as long as email is not taken 
app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    res.status('400');
    res.send('Email or password is not valid');
  } else if (helpers.findUserByEmail(users, req.body.email)) {
    res.status('400');
    res.send('Email already in use');
  } else {
    users[user_id] = { id: user_id, email: req.body.email, password: bcrypt.hashSync(req.body.password) };
    req.session["user_id"] = user_id;
    res.redirect("/urls");
  }
     
});
// logout and clear cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


//function to generate strings of 6 characters to use as the shortURL
function generateRandomString() {
  return Math.random().toString(36).slice(-6)
};


function urlsForUser (id) {
  let outputObject = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      outputObject[shortURL] = urlDatabase[shortURL];
    }
  }
  return outputObject;
}

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}!`);
});