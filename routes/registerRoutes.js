const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {

    let payload = {
        pageTitle: "Register"
    }

    res.status(200).render("register", payload);
})

router.post("/", (req, res, next) => {

    let firstName = req.body.firstName.trim();
    let lastName = req.body.lastName.trim();
    let email = req.body.email.trim();
    let userName = req.body.userName.trim();
    let password = req.body.password;

    let payload = req.body;

    if (firstName && lastName && userName && email && password) {

    } else {
        payload.errorMessage = "Make sure each field has a valid value."
        res.status(200).render("register", payload);
    }
})

module.exports = router;