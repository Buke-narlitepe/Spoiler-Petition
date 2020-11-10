const spicedPg = require("spiced-pg");

// TODO: change connection string, to connect to petition db
const db = spicedPg("postgres:buke:buke@localhost:5432/petition");

//signatures,users and user_profiles table with JOIN and get signers with city variable

module.exports.getSigners = function getSigners(city) {
    if (city) {
        return db.query(
            "SELECT users.firstname AS firstname, users.lastname AS lastname,user_profiles.age AS age, user_profiles.homepage AS homepage FROM signatures LEFT JOIN users ON users.id = signatures.user_id JOIN user_profiles ON signatures.user_id = user_profiles.user_id WHERE LOWER(p.city) = LOWER($1)",
            [city]
        );
    } else {
        return db.query(
            "SELECT users.firstname AS firstname, users.lastname AS lastname,user_profiles.age AS age, user_profiles.city AS city, user_profiles.homepage AS homepage FROM signatures LEFT JOIN users ON users.id = signatures.user_id JOIN user_profiles ON signatures.user_id = user_profiles.user_id"
        );
    }
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
        `INSERT INTO users (firstname, lastname, email, password) 
        VALUES ($1, $2, $3, $4) RETURNING id,firstname`,
        [firstname, lastname, email, password]
    );
};

module.exports.getUserByEmail = function getUserByEmail(email) {
    return db.query("SELECT * FROM users WHERE email = $1", [email]);
};

module.exports.createProfile = function createProfile(
    user_id,
    age,
    city,
    homepage
) {
    return db.query(
        `INSERT INTO user_profiles (user_id,age, city, homepage)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [user_id, age, city, homepage]
    );
};
