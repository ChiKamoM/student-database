import express from "express";
import bodyParser from "body-parser";
import mysql from 'mysql2/promise';
 


const app = express();
const port = 3000;
const pool = mysql.createPool({
  host:'localhost',
  user:'root',
  database:'mydatabase',
  password:'justmondlisok'
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"))




let students

 

app.get("/", async (req,res)=>{

  try {
    const connection = await pool.getConnection();

    const sql = 'SELECT *, DATE_FORMAT(DOB, "%Y-%m-%d") as DOB FROM students order by id ';
    const [rows] = await connection.execute(sql);
    students = rows;       
    connection.release();
  } catch (error) {
    console.log(err) 
  }

  res.render("index.ejs",{
    students:students
  })
})





app.post("/newStudent", async (req,res)=>{
  
  const studentName = req.body.name;
  const studentEmail= req.body.email;

  try {
    const connection = await pool.getConnection()
    
    const insert = 'INSERT INTO `students` (`name`, `email`)  VALUES ( ? , ?)';
    const values = [studentName,studentEmail];

    const [result, fields] = await connection.query(insert,values);

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
    const result = await 'select * from students where id = ?';
    const values = [id];
    const [rows] = await connection.execute(result,values);
    students = rows
    console.log(students)    
  } catch (error) {
    console.log(error);
  }

  res.redirect("/")
})


app.post("/show-all", async (req,res)=>{
  try {
    const connection = await pool.getConnection();

    const sql = 'select * FROM students  ';
    const [rows] = await connection.execute(sql);
    students = rows;
  } catch (error) {
    console.log(err) 
  }
  res.redirect("/")
})

app.post("/delete/:id", async (req,res)=>{
  const id = parseInt(req.params.id);
  console.log(req.params.id)

  try {
   const connection = await pool.getConnection()
   console.log(id)
   
   const sql = 'DELETE FROM `students` WHERE `id` = ? LIMIT 1';
   const values = [id];
   const [result] = await connection.execute(sql,values);


    const reply = 'select * FROM students  ';
    const [rows] = await connection.execute(reply);

    students = rows;

  } catch (error) {
    console.log(error)
  } 

  res.redirect("/")
})


app.post("/editDetails", async (req,res)=>{
  const id = req.body.id;

   console.log(`id is ${id}`);
   try {   
    const connection = await pool.getConnection()
    let result = await 'select * from students where id = ?';
    let values = [id];
    let [rows] = await connection.execute(result,values);
    const oldRecord = rows[0]
       console.log(oldRecord);
       console.log(req.body)

      const sql = 'UPDATE students SET `name` = ?, `email` = ? WHERE `id` = ? LIMIT 1';
      const values1 = [
        req.body.name || oldRecord.name,
        req.body.email ||oldRecord.email,
        req.body.phone ||oldRecord.phone,
        req.body.dob ||oldRecord.DOB
        ];
        [result] = await connection.execute(sql, values1);




    result = await 'select * from students where id = ?';
    values = [id];
    [rows] = await connection.execute(result,values);
    const updatedRecord = rows[0]
    console.log(updatedRecord)

       } catch (error) {
     console.log(error)
   }

try {
    const connection = await pool.getConnection();

    const sql = 'select * FROM students order by id ';
    const [rows] = await connection.execute(sql);
    students = rows;       
    connection.release();
  } catch (error) {
    console.log(err) 
  }

  res.redirect("/")
})                                                                    


// Api code

// Get all student records(id,name,email)
app.get("/students",async (req,res)=>{

  try {
    const connection = await pool.getConnection();

    const sql = 'select * FROM students  ';
    const [rows] = await connection.execute(sql);

    const students = rows;
    res.json(students);
    
    connection.release();
  } catch (error) {
    console.log(err)
  }
})


//Post new student(name,email)
app.post("/newStudent", async (req,res)=>{

  const studentName = req.body.name;
  const studentEmail= req.body.email;

  try {
    const connection = await pool.getConnection()
    

    //insert into students(name,email) values ('John','john@email.com');
    const insert = 'INSERT INTO `students` (`name`, `email`)  VALUES ( ? , ?)';
    const values = [studentName,studentEmail];

    const [result, fields] = await connection.query(insert,values);

    const sql = 'select * FROM students  ';
    const [rows] = await connection.execute(sql);

    const newestAdd = rows[rows.length-1];
    res.json(newestAdd);  
    connection.release();
  } catch (error) {
    console.log(error)
  } 
})


// Get specific student (id)
app.get("/student/:id", async (req,res)=>{
  const id = req.params.id;
  try {
    const connection = await pool.getConnection()
    const result = await 'select * from students where id = ?';
    const values = [id];
    const [rows] = await connection.execute(result,values);
    res.json(rows);
    
    connection.release();

  } catch (error) {
    console.log(error)
  } 
})


//Patch student(email or name)
app.patch("/updateStudent/:id", async (req,res)=>{
  const id = req.params.id;
  
  

  try {   
   // get student to be edited
    const connection = await pool.getConnection()
    let result = await 'select * from students where id = ?';
    let values = [id];
    let [rows] = await connection.execute(result,values);
    const oldRecord = rows[0]


    // edit student 

      const sql = 'UPDATE students SET `name` = ?, `email` = ? WHERE `id` = ? LIMIT 1';
      const values1 = [
        req.body.name || oldRecord.name,
        req.body.email ||oldRecord.email,
        id
      ];

    [result] = await connection.execute(sql, values1);
    
    
    
    //show edited record


    result = await 'select * from students where id = ?';
    values = [id];
    [rows] = await connection.execute(result,values);
    const updatedRecord = rows[0]

    res.json(updatedRecord);

    connection.release();
  } catch (error) {
    console.log(error)
  } 
})


// Delete a student (id)

app.delete("/delete/:id", async (req,res)=>{

  try {
   const connection = await pool.getConnection()
   
   const sql = 'DELETE FROM `students` WHERE `id` = ? LIMIT 1';
   const values = [req.params.id];
   const [result] = await connection.execute(sql,values)


    // show all records


    const reply = 'select * FROM students  ';
    const [rows] = await connection.execute(reply);

    const students = rows;
    res.json(students);
  connection.release();


  } catch (error) {
    console.log(error)
  } 
})



app.listen(port, ()=>{
      console.log(`Server running on port:${port}`)
})




