import express from "express";
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import cors from 'cors';
import db from "./config/Database.js";
import router from "./routes/index.js";

dotenv.config();
const app = express();
app.use(cookieParser());



//CORS middleware
var corsMiddleware = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); //replace localhost with actual host
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, PATCH, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization');

    next();
}

app.use(cors({ credentials: true, origin: 'http://localhost:3000'}));
app.use(corsMiddleware);
app.use(express.json());
app.use(router);

app.listen(5000, () => console.log('Server running at port 5000'));