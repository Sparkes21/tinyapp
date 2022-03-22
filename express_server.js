const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.set("view engine", "ejs");


// middleware
app.use(bodyParser.urlencoded({extended: true}));


// Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Create
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortLink = req.params.shortURL
  const templateVars = { shortURL: shortLink, longURL: urlDatabase[shortLink]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls", (req, res) => {
  const longUrl = req.body.longURL;
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = longUrl;
  console.log(urlDatabase);
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
})


function generateRandomString() {
  return Math.random().toString(36).slice(-6)
}

console.log(generateRandomString());
