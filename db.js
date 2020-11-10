const spicedPg = require("spiced-pg");

// TODO: change connection string, to connect to petition db
const db = spicedPg("postgres:buke:buke@localhost:5432/petition");

// TODO: get signatures
module.exports.getSignatures = function getSignatures() {
    return db.query("SELECT * FROM signatures");
};

// TODO: add signature
module.exports.addSignature = function addSignature(signature, user_id) {
    return db.query(
        "INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id",
        [signature, user_id]
    );
};

module.exports.getSignatureById = function getSignatureById(id) {
    return db.query("SELECT * FROM signatures WHERE id = $1", [id]);
};

module.exports.createUser = function createUser(
    firstname,
    lastname,
    email,
    password
) {
    return db.query(
        "INSERT INTO users (firstname, lastname, email, password) VALUES ($1, $2, $3, $4) RETURNING id,firstname",
        [firstname, lastname, email, password]
    );
};

module.exports.getUserByEmail = function getUser(email) {
    return db.query("SELECT * FROM users WHERE email = $1", [email]);
};
