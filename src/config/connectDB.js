const mongoose = require("mongoose");

const connectDB = () => {
    const MONGO_URL = process.env.MONGODB_URI;
    
    mongoose.connect(MONGO_URL)
        .then(res => {
            console.log("Connected to database done")
        })
        .catch(err => {
            console.log("Error:", err.message)
        })
}

module.exports = connectDB;