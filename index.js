import express from "express";
import bodyParser from "body-parser";
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid'; 
import 'dotenv/config';
import bcrypt from "bcrypt";


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




app.get("/register", async (req,res) =>{
  res.render("register.ejs")
})

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  let uuid = uuidv4().slice(0,4)

  try {
    const connection = await pool.getConnection();

    let sql = "SELECT * FROM users WHERE email = ?";
    let values = [email];
    let [rows] = await connection.execute(sql, values);

    if (rows.length < 1) {
      const hash = await bcrypt.hash(password, saltRounds);

      console.log(name, email, hash,uuid);

      sql = "INSERT INTO users(name, email, password, uuid) VALUES(?, ?, ?, ?)";
      values = [name, email, hash, uuid];
      console.log(name, email, hash,uuid);

      await connection.execute(sql, values);
      console.log(rows)
      verified = true;
      currentUser = 1
      res.redirect("/");
    } else {
      console.log("user exists");
      res.render("login.ejs");
    }

    connection.release();
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});



app.get("/login", (req,res)=>{
  res.render("login.ejs")
})


app.post("/login", async (req,res)=>{
  const loginEmail = req.body.email;
  const loginPassword = req.body.password

  try {
    const connection = await pool.getConnection();
    let sql = "SELECT * FROM users WHERE email = ?";
    let values = [loginEmail];
    let [rows] = await connection.execute(sql,values);
   


    if(rows.length > 0) {
      let {password} = rows[0];     
      
      
      bcrypt.compare(loginPassword, password, (err, result)=> {
          if(err){ 
            console.log(err)
          }else{
            if(result){
              verified = true;
              currentUser = rows[0].user_uuid
              res.redirect("/")
            }else{
              res.send("Incorrect password")
            }
          }
      });      
    }else{
      res.send("user does not exist")
    }
  } catch (error) {
    console.log(error)
    res.redirect("/")
  }
})

app.post("/logout", (req,res)=>{
  verified=false;
  res.redirect("/")
})
      
 

app.get("/", async (req,res)=>{
  if (!verified){
  res.render("login.ejs")
 }else{
   try {
    const connection = await pool.getConnection();
    const sql = 'SELECT `DOB`,`name`,`email`,`phone`,`student_uuid`, DATE_FORMAT(DOB, "%Y-%m-%d") as DOB FROM students WHERE user_id = ? ';
    let values = [currentUser]
    const [rows] = await connection.execute(sql,values);
    students = rows;
     res.render("index.ejs",{
    students:students
  })

    connection.release();
  } catch (error) {
    console.log(error) 
  }
 }  
})



app.post("/newStudent", async (req,res)=>{
  
  let uid = uuidv4().slice(0,10);


  try {
    const connection = await pool.getConnection()
    
    const insert = 'INSERT INTO `students` (`name`,`email`,`phone`,`DOB`, `student_uuid`,`user_id`) VALUES (?, ?, ?, ?,?,?)';
    const values = [req.body.name ,req.body.email, req.body.phone, req.body.dob, uid, currentUser];

    const [result, fields] = await connection.query(insert,values);
    console.log(result)
  } catch (error) {
    console.log(error)
  }

  try {
    const connection = await pool.getConnection();

    const sql = 'select * FROM students order by id ';
    const [rows] = await connection.execute(sql);
    students = rows;
  } catch (error) {
    console.log(err) 
  }

  res.redirect("/")
})


app.post("/search", async (req,res)=>{
  const id = req.body.studentId;
  try {
    const connection = await pool.getConnection()
    const result = await 'select * from students where student_uuid = ?';
    const values = [id];
    const [rows] = await connection.execute(result,values);
    students = rows
    console.log(students)    
  } catch (error) {
    console.log(error);
  }

  res.redirect("/")
})


app.post("/delete", async (req,res)=>{
 const id = req.body.id



  try {
   const connection = await pool.getConnection()
   console.log(id)
   
   const sql = 'DELETE FROM `students` WHERE `student_uuid` = ? LIMIT 1';
   const values = [id];
   const [result] = await connection.execute(sql,values);
   console.log(result);

  } catch (error) {
    console.log(error)
  } 

  res.redirect("/")
})


app.post("/editDetails", async (req,res)=>{
  const id = req.body.id;
   try {   
    const connection = await pool.getConnection()
    let result = await 'select * from students where student_uuid = ?';
    let values = [id];
    let [rows] = await connection.execute(result,values);
    let oldRecord = rows[0]
       

       const sql = 'update students set name = ?, email = ?, phone = ?, DOB = ? WHERE student_uuid = ? LIMIT 1';
       const values1 = [
         req.body.name || oldRecord.name,
         req.body.email ||oldRecord.email,
         req.body.phone ||oldRecord.phone,
         req.body.dob ||oldRecord.DOB,
         [id]
         ];

      let  [results,fields] = await connection.query(sql, values1)
      
      console.log(results);
         
        } catch (error) {
     console.log(error)
   }

  res.redirect("/")
})                                                                    


app.listen(port, ()=>{
      console.log(`Server running on port:${port}`)
})




