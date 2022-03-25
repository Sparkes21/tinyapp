const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");


const hash = bcrypt.hashSync(" ", 10);
const compare = bcrypt.compareSync(" ", hash);

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

//Requests
app.get('/', (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
  
});

app.get("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    return res.status('401').send('Error, log in required to view this page <a href="/login">login</a>');
  };
  const user_id = req.cookies.user_id;
  const userURLS = urlsForUser(user_id);
  const templateVars = {  user: users[user_id], urls: userURLS };
  console.log(users);
  res.render("urls_index", templateVars);
});

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
  if (!req.cookies.user_id) {
    return res.status('401').send('Error, log in required to view this page <a href="/login">login</a>');
  };
  const user_id = req.cookies.user_id;
  const shortUrl = req.params.shortURL
  const userURLS = urlsForUser(user_id);
   if (!Object.keys(userURLS).includes(shortUrl)) {
     return res.status('401').send('Error, this shortUrl does not belong to you');
   };
  const templateVars = { user: users[user_id], shortURL: shortUrl, longURL: urlDatabase[shortUrl].longURL};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
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
  console.log("create short url: ", urlDatabase);
  res.redirect("/urls");         
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});




// deletes a url 
app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.cookies.user_id;
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
  const user_id = req.cookies.user_id;
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

//login page and login request
app.get("/login", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = { user: users[user_id] };
  res.render("login", templateVars);
});

// registration page and register request
app.get("/register", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = { user: users[user_id] }
  res.render("registration", templateVars);
});

app.post("/login", (req, res) => {
  const user = findUserByEmail(users, req.body.email);
  if (!user) {
    res.status('403');
    res.send('Email not found');
    return;
  }
  if (bcrypt.compareSync(req.body.password , user.password)) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status('403');
    res.send('Incorrect password');
  };
  
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
    users[user_id] = { id: user_id, email: req.body.email, password: bcrypt.hashSync(req.body.password) };
    res.cookie("user_id", user_id);
    res.redirect("/urls");
  }
     
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
    if (users[id].email === email) {
      
      // console.log('email already taken');
      return users[id];
    }
  }
  return undefined;
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