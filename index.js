import express from "express";
import bodyParser from "body-parser";
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid'; 
import 'dotenv/config';
import bcrypt from "bcrypt";

import router from "./src/routes/routes";

const app = express();
const port = 3000;
const pool = mysql.createPool({
  host:process.env.DATABASE_HOST,
  user:process.env.DATABASE_USER,
  database:process.env.DATABASE_NAME,
  password:process.env.DATABASE_PASSWORD
});


const saltRounds = 2;



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"))


let verified = false;
let currentUser
let students





app.listen(port, ()=>{
      console.log(`Server running on port:${port}`)
})




