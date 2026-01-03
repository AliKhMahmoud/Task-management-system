require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookies = require("cookie-parser");
const { apiLimiter } = require("./middlewares/rateLimit.middleware");
const helmet = require("helmet");
const cors = require("cors");
const xssSanitize = require("./middlewares/xss.middleware");

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use(cookies())

// protect from xss
app.use(xssSanitize);

// Enhanced security headers specifically for auth
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            frameAncestors: ["'none'"], // Prevent clickjacking
            formAction: ["'self'"] // Restrict form submissions
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// CORS
app.use(cors({
    origin: ["http://localhost:5167"],
}));

// Rate Limiter
app.use(apiLimiter); 

// Routes
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/users', require('./routes/users.route'));
app.use('/api/projects', require('./routes/projects.route'));
app.use('/api/tasks', require('./routes/tasks.route'));
app.use('/api/notes', require('./routes/notes.route'));
// app.use('/api/activities', require('./routes/activity.routes'));

// Error Middleware
app.use(require("./middlewares/error.middleware"));

// Not Found
app.use(require("./middlewares/notFound.middleware"))

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGODB_URI;

mongoose.connect(MONGO_URL)
    .then(res => {
        console.log("Connected to database done")
        app.listen(PORT, () => {
            console.log(`Server is running on: http://localhost:${PORT}`)
        })
    })
    .catch(err => {
        console.log("Error:", err.message)
    })
