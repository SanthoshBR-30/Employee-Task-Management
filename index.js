import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "",
  password: "",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

let users = [];
let items = [];

async function getCurrentUser() {
  const result = await db.query("SELECT * FROM users");
  users = result.rows;
  return users.find((user) => user.id == currentUserId);
}
app.get("/", async (req, res) => {
  try {
    const currentUser = await getCurrentUser();
    const result = await db.query("SELECT * FROM notes where user_id =$1",[currentUserId]);
    items = result.rows;
    res.render("index.ejs", {
      listTitle: "Today's Task",
      listItems: items,
      users: users,
    
    });
  } catch (err) {
    console.log(err);
  }
});

//travel


app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  const currentUser = await getCurrentUser();
  // items.push({title: item});
  try {
    await db.query("INSERT INTO notes (title,user_id) VALUES ($1,$2)", [item,currentUserId]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/edit", async (req, res) => {
  const item = req.body.updatedItemTitle;
  const id = req.body.updatedItemId;

  try {
    await db.query("UPDATE notes SET title = ($1) WHERE id = $2", [item, id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  try {
    await db.query("DELETE FROM notes WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});


app.post("/user", async (req, res) => {
  if (req.body.add === "new") {
    res.render("new.ejs");
  } else {
    currentUserId = req.body.user;
    res.redirect("/");
  }
});

app.post("/new", async (req, res) => {
  const name = req.body.name;

  const result = await db.query(
    "INSERT INTO users (name) VALUES($1) RETURNING *;",
    [name]
  );

  const id = result.rows[0].id;
  currentUserId = id;

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
