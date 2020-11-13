const express = require("express");
const exphbs = require("express-handlebars");
const db = require("./db.js");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const bcrypt = require("bcryptjs");

const app = express();

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(
    cookieSession({
        secret: "We are the champions!",
        maxAge: 5 * 365 * 24 * 60 * 60 * 1000, // 5 year
    })
);

app.use(csurf());

// must come after the csurf middleware
app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    res.locals.session = req.session;
    next();
});

// THIS WILL PREVENT US FROM CLICKJACKING
app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    next();
});

app.get("/", (req, res) => {
    if (!req.session.user_id) return res.redirect("/login");
    Promise.all([db.countSigners(), db.getSignatureById(req.session.user_id)])
        .then((data) => {
            if (data[1].rows.length === 1) return res.redirect("/thank-you");
            res.render("home", {
                signers: data[0].rows[0].count,
            });
        })
        .catch((err) => console.log("Error in /thanks: ", err));
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    if (
        req.body.firstname &&
        req.body.lastname &&
        req.body.email &&
        req.body.password
    ) {
        bcrypt
            .hash(req.body.password, 10)
            .then((hash) => {
                return db.createUser(
                    req.body.firstname,
                    req.body.lastname,
                    req.body.email,
                    hash
                );
            })
            .then((value) => {
                req.session.user_id = value.rows[0].id;
                req.session.firstname = value.rows[0].firstname;
                res.redirect("/profile");
            })
            .catch(() => {
                res.render("register", {
                    error: true,
                });
            });
    } else {
        res.render("register", {
            error: true,
        });
    }
});

app.get("/login", (req, res) => {
    if (!req.session.user_id) {
        res.render("login");
    } else {
        res.redirect("/");
    }
});

app.post("/login", (req, res) => {
    if (req.body.email) {
        db.getUserByEmail(req.body.email).then((value) => {
            if (value.rows.length === 0) {
                return res.render("login", { error: true });
            }
            bcrypt
                .compare(req.body.password, value.rows[0].password)
                .then((match) => {
                    if (match) {
                        req.session.user_id = value.rows[0].id;
                        req.session.firstname = value.rows[0].firstname;
                        res.redirect("/");
                    } else {
                        res.render("login", {
                            error: true,
                        });
                    }
                });
        });
    }
});

app.get("/profile", (req, res) => {
    if (!req.session.user_id) {
        return res.redirect("/login");
    }
    res.render("profile");
});

app.post("/profile", (req, res) => {
    if (!req.session.user_id) {
        return res.redirect("/login");
    }
    if (req.body.homepage) {
        if (!req.body.homepage.startsWith("http")) {
            res.render("profile", { error: true });
        }
    }
    console.log(req.body, "post-profile");
    db.createProfile(
        req.session.user_id,
        req.body.age,
        req.body.city,
        req.body.homepage
    ).then(() => {
        res.redirect("/");
    });
});

app.get("/spoiler", (req, res) => {
    return res.render("spoiler");
});

app.get("/sure", (req, res) => {
    return res.render("sure");
});

app.get("/profile/edit", (req, res) => {
    if (!req.session.user_id) {
        return res.redirect("/login");
    }
    db.editProfile(req.session.user_id)
        .then((data) => {
            console.log(data.rows[0]);
            console.log(req.session.user_id);
            res.render("editprofile", {
                profile: data.rows[0],
            });
        })
        .catch(() => {
            res.render("editprofile", {
                error: true,
            });
        });
});

app.post("/profile/edit", (req, res) => {
    if (!req.session.user_id) {
        return res.redirect("/login");
    }
    let promises = [];

    if (req.body.password) {
        promises.push(
            bcrypt.hash(req.body.password, 10).then((hash) => {
                return db.updatePassword(req.session.user_id, hash);
            })
        );
    }
    promises.push(
        db.updateUser(
            req.session.user_id,
            req.body.firstname,
            req.body.lastname,
            req.body.email
        )
    );

    promises.push(
        db.updateProfile(
            req.session.user_id,
            req.body.age,
            req.body.city,
            req.body.homepage
        )
    );
    Promise.all(promises)
        .then(() => {
            res.redirect("/");
        })
        .catch(function (error) {
            console.log("error:", error);
        });
});

app.post("/signature/delete", (req, res) => {
    if (!req.session.user_id) {
        return res.redirect("/login");
    }
    db.deleteSignatures(req.session.user_id)
        .then(function () {
            req.session.signed = null;
            res.redirect("/");
        })
        .catch(function (error) {
            console.log("error deleting signature:", error);
        });
});

app.get("/signers", (req, res) => {
    if (!req.session.user_id) {
        return res.redirect("/login");
    }
    db.getSigners().then((data) => {
        res.render("signers", {
            signatures: data.rows,
        });
        console.log(data.rows, "get-signers");
    });
});

app.get("/signers/:city", (req, res) => {
    if (!req.session.user_id) {
        return res.redirect("/login");
    }
    const city = req.params.city;
    db.getSigners(city).then((data) => {
        res.render("signers", { signatures: data.rows });
    });
});

app.post("/sign-petition", (req, res) => {
    if (!req.session.user_id) {
        return res.redirect("/login");
    }
    if (req.body.signature) {
        db.addSignature(req.body.signature, req.session.user_id).then(() => {
            req.session.signed = "true";
            res.redirect("/thank-you");
        });
    } else {
        res.render("home", {
            error: true,
        });
    }
});
app.get("/thank-you", (req, res) => {
    if (!req.session.user_id) return res.redirect("/login");
    Promise.all([db.countSigners(), db.getSignatureById(req.session.user_id)])
        .then((data) => {
            console.log(data);
            if (data[1].rows.length === 0) return res.redirect("/");

            res.render("thank", {
                signature: data[1].rows[0].signature,
                signers: data[0].rows[0].count,
            });
        })
        .catch((err) => console.log("Error in /thanks: ", err));
});

app.get("/logout", function (req, res) {
    req.session = null;
    res.redirect("/login");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("PETITION IS LISTENING...");
});

module.exports = app;
