const spicedPg = require("spiced-pg");

// TODO: change connection string, to connect to petition db
const db = spicedPg(
    process.env.DATABASEURL || "postgres:buke:buke@localhost:5432/petition"
);

//signatures,users and user_profiles table with JOIN and get signers with city variable

module.exports.getSigners = function getSigners(city) {
    if (city) {
        return db.query(
            `SELECT users.firstname AS firstname, users.lastname AS lastname,user_profiles.age AS age, user_profiles.homepage AS homepage 
            FROM signatures JOIN users ON users.id = signatures.user_id 
            LEFT JOIN user_profiles ON signatures.user_id = user_profiles.user_id 
            WHERE LOWER(user_profiles.city) = LOWER($1)`,
            [city]
        );
    } else {
        return db.query(
            `SELECT users.firstname AS firstname, users.lastname AS lastname,user_profiles.age AS age, user_profiles.city AS city, user_profiles.homepage AS homepage 
            FROM signatures JOIN users ON users.id = signatures.user_id 
            LEFT JOIN user_profiles ON signatures.user_id = user_profiles.user_id`
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
    return db.query("SELECT * FROM signatures WHERE user_id = $1", [id]);
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
        `INSERT INTO user_profiles (user_id, age, city, homepage)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [user_id, age === "" ? null : age, city, homepage]
    );
};

module.exports.editProfile = function editProfile(input) {
    return db.query(
        `SELECT * FROM users
        LEFT JOIN user_profiles
        ON user_profiles.user_id = users.id
        WHERE users.id = $1`,
        [input]
    );
};

module.exports.updateProfile = function updateProfile(
    user_id,
    age,
    city,
    homepage
) {
    return db.query(
        `INSERT INTO user_profiles (user_id, age, city, homepage)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET age = $2, city = $3, homepage = $4
    RETURNING id`,
        [user_id, age === "" ? null : age, city, homepage]
    );
};

module.exports.updateUser = function updateUser(
    user_id,
    firstname,
    lastname,
    email
) {
    return db.query(
        `UPDATE users SET firstname=$2,lastname=$3,email=$4 WHERE id=$1`,
        [user_id, firstname, lastname, email]
    );
};

module.exports.updatePassword = function updatePassword(user_id, password) {
    return db.query(`UPDATE users SET password = $2 WHERE id=$1`, [
        user_id,
        password,
    ]);
};

module.exports.deleteSignatures = function deleteSignatures(id) {
    return db.query(`DELETE FROM signatures WHERE user_id = $1`, [id]);
};

module.exports.countSigners = function countSigners() {
    return db.query(`SELECT COUNT(signature) FROM signatures`);
};
