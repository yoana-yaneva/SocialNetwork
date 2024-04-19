const express = require('express');
const app = express();
const router = express.Router();

app.set("view engine", "pug");
app.set("views", "views");

router.get("/", (req, res, next) => {

    let payload = {
        pageTitle: "Login"
    }
    
    res.status(200).render("login", payload);
})

module.exports = router;