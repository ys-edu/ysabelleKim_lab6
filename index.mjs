import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool
const pool = mysql.createPool({
    host: "sql3.freesqldatabase.com",
    user: "sql3823058",
    password: "PA6DXa1PCS",
    database: "sql3823058",
    connectionLimit: 10,
    waitForConnections: true
});

//routes
app.get('/', (req, res) => {
    res.render('index')
});

app.get("/quotes", async function(req, res){
    let sql = `SELECT quoteId, authorId, category, likes, firstName, lastName, quote
            FROM q_quotes
            NATURAL JOIN q_authors
            ORDER BY authorId`;
    const [rows] = await pool.query(sql);
    res.render("quoteList.ejs", {"quotes":rows});
});

app.get("/quote/new", async function(req, res) {
    let sql = `SELECT *
            FROM q_authors
            ORDER BY lastName`;
    const [rows] = await pool.query(sql);
    res.render("newQuote", {"authors":rows});
});

app.post("/quote/new", async function(req, res){
    let sql = `SELECT *
            FROM q_authors
            ORDER BY lastName`;
    let quote = req.body.quote;
    let category = req.body.category;
    let likes = req.body.likes;
    let q_authorId = req.body.q_authorId;
    let sql2 = `INSERT INTO q_quotes
             (quote, category, likes, authorId)
              VALUES (?, ?, ?, ?)`;
    let params2 = [quote, category, likes, q_authorId];
    const [rows] = await pool.query(sql);
    const [rows2] = await pool.query(sql2, params2);
    res.render("newQuote", {"authors":rows, "message": "Quote added!"});
});

app.get("/quote/edit", async function(req, res){
    let quoteId = req.query.quoteId;
    let sql = `SELECT quoteId, q_authors.authorId, firstName, lastName, quote, category, likes
        FROM q_quotes
        NATURAL JOIN q_authors
        WHERE quoteId = ${quoteId}`;
    const [rows] = await pool.query(sql);
    res.render("editQuote", {"quoteInfo":rows});
});

app.post("/quote/edit", async function(req, res){
    let sql = `UPDATE q_quotes 
        SET authorId = ?, 
            category = ?, 
            likes = ?, 
            quote = ?
        WHERE quoteId = ?`;
    // params sent to editAuthor.ejs, NOT the same as sql above
    let params = [req.body.q_authorId, req.body.category, req.body.likes, req.body.quote, req.body.quoteId];
    const [rows] = await pool.query(sql, params);
    res.redirect("/quotes");
});

app.get("/quote/delete", async function(req, res){
    let quoteId = req.query.quoteId;
    let sql = `DELETE 
        FROM q_quotes
        WHERE quoteId = ?`;
    const [rows] = await pool.query(sql, [quoteId]);
    res.redirect("/quotes");
});

app.get("/authors", async function(req, res){
    let sql = `SELECT *
            FROM q_authors
            ORDER BY lastName`;
    const [rows] = await pool.query(sql);
    res.render("authorList", {"authors":rows});
});

app.get("/author/new", (req, res) => {
    res.render("newAuthor");
});

app.post("/author/new", async function(req, res){
    let fName = req.body.ejs_fName;
    let lName = req.body.ejs_lName;
    let dob = req.body.ejs_dob;
    let dod = req.body.ejs_dod;
    let sex = req.body.ejs_sex;
    let job = req.body.ejs_job;
    let country = req.body.ejs_country;
    let img = req.body.ejs_img;
    let bio = req.body.ejs_bio;
    let sql = `INSERT INTO q_authors
             (firstName, lastName, dob, dod, sex, profession, country, portrait, biography)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    let params = [fName, lName, dob, dod, sex, job, country, img, bio];
    const [rows] = await pool.query(sql, params);
    res.render("newAuthor", {"message": "Author added!"});
});

app.get("/author/edit", async function(req, res){
    let authorId = req.query.authorId;
    let sql = `SELECT *,
        DATE_FORMAT(dob, '%Y-%m-%d') dobISO,
        DATE_FORMAT(dod, '%Y-%m-%d') dodISO
        FROM q_authors
        WHERE authorId = ${authorId}`;
    const [rows] = await pool.query(sql);
    res.render("editAuthor", {"authorInfo":rows});
});

app.post("/author/edit", async function(req, res){
    let sql = `UPDATE q_authors
        SET firstName = ?,
            lastName = ?,
            dob = ?,
            dod = ?,
            sex = ?,
            profession = ?,
            country = ?,
            portrait = ?,
            biography = ?
        WHERE authorId =  ?`;
    // params sent to editAuthor.ejs, NOT the same as sql above
    let params = [
        req.body.fName,
        req.body.lName,
        req.body.birthDate,
        req.body.deathDate,
        req.body.sex,
        req.body.profession,
        req.body.country,
        req.body.img,
        req.body.bio,
        req.body.authorId];
    const [rows] = await pool.query(sql,params);
    res.redirect("/authors");
});

app.get("/author/delete", async function(req, res){
    let authorId = req.query.authorId;
    let sql = `DELETE 
        FROM q_authors
        WHERE authorId = ?`;
    const [rows] = await pool.query(sql, [authorId]);
    res.redirect("/authors");
});

app.get("/dbTest", async(req, res) => {
    try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error");
    }
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
})