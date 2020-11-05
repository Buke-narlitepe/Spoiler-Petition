const express = require("express");
const exphbs = require("express-handlebars");
// var canvas = document.getElementById("canvas");
// var dataURL = canvas.toDataURL();
const db = require("./db.js");

const app = express();

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// TODO: render signature form
app.get("/", (req, res) => {
    res.render("home");
});

//show home template with error

app.get("/sign-petition", (req, res) => {
    res.render("home");
});

// TODO: render list of all signers
app.get("/signers", (req, res) => {
    db.getSignatures().then((data) => {
        res.render("signers", {
            signatures: data.rows,
        });
    });
});

// TODO: add signature
app.post("/signers", (req, res) => {
    if (req.body.firstname && req.body.lastname && req.body.signature) {
        db.addSignature(
            req.body.firstname,
            req.body.lastname,
            req.body.signature
        ).then(() => {
            res.redirect("/thank-you");
        });
    } else {
        res.render("home", {
            error: true,
        });
    }
});

// TODO: new route for thank-you page

app.get("thank-you", (req, res) => {
    res.render("thank");
});

app.get("/sign-petition", (req, res) => {
    res.render("home");
});

app.listen(3000, () => {
    console.log("PETITION IS LISTENING...");
});
