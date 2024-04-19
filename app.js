const express = require('express');
const app = express();
const port = 3003;
const middleware = require('./middleware');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('./database');
const session = require('express-session');

const server = app.listen(port, () => console.log("Server up and running at port: " + port));

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
//hashing session and saving session
app.use(session({
    secret: "Diplomna rabota",
    saveUninitialized: false
}))

//Routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');

app.use("/login", loginRoute);
app.use("/register", registerRoute);

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", middleware.requireLogin, (req, res, next) => {

    let payload = {
        pageTitle: "Home"
    }

    res.status(200).render("home", payload);
})