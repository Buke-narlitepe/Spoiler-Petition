const spicedPg = require("spiced-pg");

// TODO: change connection string, to connect to petition db
const db = spicedPg("postgres:johannes:postgres@localhost:5432/petition");

// TODO: get signatures
module.exports.getSignatures = function getSignatures() {
    return db.query("SELECT * FROM signatures");
};

// TODO: add signature
module.exports.addSignature = function addSignature(
    firstname,
    lastname,
    signature
) {
    return db.query(
        "INSERT INTO signatures (firstname, lastname, signature) VALUES ($1, $2, $3)",
        [firstname, lastname, signature]
    );
};
