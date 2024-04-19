const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../schemas/UserSchema');

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {

    let payload = {
        pageTitle: "Register"
    }

    res.status(200).render("register", payload);
})

router.post("/", async (req, res, next) => {

    let firstName = req.body.firstName.trim();
    let lastName = req.body.lastName.trim();
    let email = req.body.email.trim();
    let username = req.body.username.trim();
    let password = req.body.password;

    let payload = req.body;
    //checking if the username or email is already exists
    if (firstName && lastName && username && email && password) {
        let user = await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        }).catch((err) => {
            console.log(err);

            payload.errorMessage = "Something went wrong."
            res.status(200).render("register", payload);

        })

        if (user == null) {
            //inserting users into cluster
            let data = req.body;

            User.create(data)
            .then((user) => {
                console.log(user);
            })
        }
        else {
            //found
            if (email == user.email) {
                payload.errorMessage = "Email already exists."
            } else {
                payload.errorMessage = "Email already exists."
            }
            res.status(200).render("register", payload);
        }

    } else {
        payload.errorMessage = "Make sure each field has a valid value."
        res.status(200).render("register", payload);
    }
})

module.exports = router;