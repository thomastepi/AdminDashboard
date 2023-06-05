const express = require("express");
const session = require("express-session");
const mysql = require("mysql");
const app = express();

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Database configuration
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "PObox69Kumba",
  database: "my_db",
});

// Connect to the database
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to the database...");
});

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", (req, res) => {
  const { username, password } = req.body;
  const user = { username, password };

  db.query("INSERT INTO admins SET ?", user, (err) => {
    if (err) {
      throw err;
    }
    res.redirect("/login");
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signinError", (req, res) => {
  res.render("signinError");
});

app.get("/modify_item", (req, res) => {
  res.render("modify_item");
});

app.post("/modify_item", (req, res) => {
  var id = req.body.id;
  var newName = req.body.name;
  var newPrice = req.body.price;
  console.log(`${newPrice}, ${newName}, ${id}`);
  db.query(
    "UPDATE menu SET price = ?, name = ? WHERE id = ?",
    [newPrice, newName, id],
    (err, result, rows, fields) => {
      if (err) {
        throw err;
      } else {
        res.redirect("/dashboard");
      }
    }
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM admins WHERE username = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) {
        throw err;
      }

      if (results.length === 1) {
        req.session.loggedIn = true;
        req.session.username = username;
        res.redirect("/dashboard");
      } else {
        res.redirect("/signinError");
      }
    }
  );
});

app.get("/dashboard", (req, res) => {
  db.query("SELECT * FROM menu", (err, result) => {
    if (req.session.loggedIn) {
      // console.log(result);
      res.render("dashboard", {
        username: req.session.username,
        result: result,
      });
    } else {
      res.redirect("/");
    }
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      throw err;
    }
    res.redirect("/login");
  });
});

const port = 8888;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
