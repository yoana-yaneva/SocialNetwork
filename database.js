const mongoose = require("mongoose");

class Database {

    constructor() {
        this.connect();
    }

    connect() {
        mongoose.connect("mongodb+srv://yanevay6:H6qjldjKCMp9ukK6@socialnetworkcluster.ll3jldf.mongodb.net/?retryWrites=true&w=majority&appName=SocialNetworkCluster")
            .then(() => {
                console.log("Database connection successful");
            })
            .catch((error) => {
                console.log("Database connection ERROR " + error);
            })
    }
}

module.exports = new Database();