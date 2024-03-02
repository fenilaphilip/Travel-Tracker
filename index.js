import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "World",
    password: process.env.db_pass,
    port: 5432,
});
db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

let countries;
app.get("/", async (req, res) => {
    countries = await MarkCountriesVisted();
    const users = await getAllUsers();
    // console.log(`users : ` + JSON.stringify(users));

    res.render("index.ejs", {
        total: countries.length,
        countries: countries,
        users: users,

    });
});

async function getAllUsers() {
    const result = await db.query("SELECT * FROM users")
    let users = [];
    result.rows.forEach((user) => {
        users.push(user);
    });
    return users;
}

app.get("/new", (req, res) => {
    res.render("partials/new.ejs");
});

app.post("/user", (req, res) => {
    // console.log(req.body);
    if (req.body.add === "new") {
        res.render("new.ejs");
    } else {
        current_user_id = req.body.user;
        // console.log(`current_user_id : ` + current_user_id);
        res.redirect("/");
    }
});

app.post("/add", async (req, res) => {
    const newly_visited_country = req.body.country;
    console.log(newly_visited_country);
    try {
        const result = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name)=$1", [newly_visited_country.toLowerCase()]);
        const newly_visited_country_code = result.rows[0].country_code;
        console.log(newly_visited_country_code);
        try {
            await db.query("INSERT INTO visited_countries(country_code) VALUES($1)", [newly_visited_country_code]);
            res.redirect("/");
        } catch (err) {
            res.render("index.ejs", {
                total: countries.length,
                countries: countries,
                error: "Country has already been added, try again.",
            });
        }
    } catch (err) {
        console.log(err);
        res.render("index.ejs", {
            total: countries.length,
            countries: countries,
            error: "Country name does not exist, try again.",
        });
    }
});

async function MarkCountriesVisted() {
    let countries_visited = [];
    const result = await db.query("SELECT country_code FROM visited_countries");
    result.rows.forEach((country) => {
        countries_visited.push(country.country_code);
    });
    console.log(countries_visited);
    return countries_visited;
}

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
