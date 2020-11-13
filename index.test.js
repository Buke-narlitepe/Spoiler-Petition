const supertest = require("supertest");
const cookieSession = require("cookie-session");
// const db = require("./db.js");
// jest.mock("./db.js");

const app = require("./index.js");

test("logout route should redirect the user to /login", () => {
    return supertest(app)
        .get("/logout")
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/login");
        });
});

test("Users who are logged in are redirected to the petition page when they attempt to go to registration page", () => {
    cookieSession.mockSessionOnce({
        user_id: 12,
    });

    return supertest(app)
        .get("/register")
        .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.headers.location).toBe("/");
        });
});
/*
test("Users who are logged in are redirected to the petition page when they attempt to go to login page", () => {
    cookieSession.mockSessionOnce({
        user_id: 12,
    });

    return supertest(app)
        .get("/login")
        .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.headers.location).toBe("/");
        });
});

test("Users who are logged in and have signed the petition are redirected to the thank you page when they attempt to go to the petition page", () => {
    cookieSession.mockSessionOnce({
        user_id: 12,
    });

    db.getSignatureById.mockResolvedValue({
        rows: [
            {
                user_id: 12,
            },
        ],
    });

    return supertest(app)
        .get("/")
        .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.headers.location).toBe("/thank-you");
        });
});

test("Users who are logged in and have signed the petition are redirected to the thank you page when they attempt to go to submit a signature", () => {
    cookieSession.mockSessionOnce({
        user: 12,
    });

    db.addSignature.mockResolvedValue({
          rows: [
            {
                user_id: 12,
            },
        ],      rows: [{}],
    });

    return supertest(app)
        .post("/sign-petition")
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/thank-you");
        });
});

test("Users who are logged in and have not signed the petition are redirected to the petition page when they attempt to go to the thank you page", () => {
    cookieSession.mockSessionOnce({
        userId: 12,
    });

    db.getSignatureById.mockResolvedValue({});

    return supertest(app)
        .get("/thank-you")
        .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.headers.location).toBe("/");
        });
});

test("Users who are logged in and have not signed the petition are redirected to the petition page when they attempt to go to the signers page", () => {
    cookieSession.mockSessionOnce({
        userId: 12,
    });

    db.getSignatureById.mockResolvedValue({});

    return supertest(app)
        .get("/signers")
        .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.headers.location).toBe("/signers");
        });
});
*/
