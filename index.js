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
    res.render("index.ejs",{
        total: countries.length,
    });
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
