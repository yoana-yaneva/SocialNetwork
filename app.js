const express = require('express');
const app = express();
const port = 3003;
const middleware = require('./middleware')

const server = app.listen(port, () => console.log("Server up and running at port: " + port));

app.set("view engine", "pug");
app.set("views", "views");


app.get("/", middleware.requireLogin, (req, res, next) => {

    let payload = {
        pageTitle: "Home"
    }

    res.status(200).render("home", payload);
})