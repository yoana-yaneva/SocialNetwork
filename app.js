const express = require('express');
const app = express();
const port = 3003;
const middleware = require('./middleware');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://yanevay6:H6qjldjKCMp9ukK6@socialnetworkcluster.ll3jldf.mongodb.net/?retryWrites=true&w=majority&appName=SocialNetworkCluster")
.then(()=> {
    console.log("Database connection successful");
})
.catch((error)=> {
    console.log("Database connection ERROR "+ error);
})

const server = app.listen(port, () => console.log("Server up and running at port: " + port));

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")))

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