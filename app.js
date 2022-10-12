const express=require('express')
const app =express();

const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const auth = require("./middleware/auth");
const axios=require('axios')

const userModel =require('./database/models/user')
const toDoModel=require('./database/models/todo')
const db=require('./database/index')
require("dotenv").config();
const { PORT,TOKEN_KEY } = process.env;
db.init()  //for DB connection

app.use(express.json())
app.use(express.urlencoded({extented:true}))
app.set("view engine","ejs");


app.get('/', (req, res) => {
	res.render("homePage");
})

app.post("/welcome", auth, (req, res) => {
	if(req.user)
	{
		res.end()
		console.log("Success in /welcome")
		return;
	}	
	// res.end()
  });

app.get('/login', (req, res) => {
	res.render("login");
})

app.get('/register', (req, res) => {
	res.render("register");
})

// app.get('/todo',auth, (req, res) => {
// 	res.render("toDo");
// })
app.use(express.static('Public'))

// getting user
app.route('/user').get((req,res)=>{
    userModel.find( {} )
		.then(function(data)
    {
		res.json(data);
      
      if(data === null)
      {
		res.end("No data")
      } 
      
    }).catch(function(err)
    {
        res.json({msg:err});	
        console.log(err)
    })

}).post((req,res)=>{
	const response=req.body
	const username=response.username;
	const password=response.password;
	const repeatpass=response.repeatPass;
	if(!username)
	{
			res.json({ msg:"Please Enter Username"})
			return
	}
		if(!password)
	{
        res.json({ msg:"Please Enter Password"})
			
			return
	}
    if(!repeatpass)
	{
        res.json({ msg:"Please Enter Confirm Password"})
			
			return
	}

  if(username && (password ===repeatpass))
  {
					userModel.create(
						{
							username:username,
							password:password

						}
					)
					.then(()=>
					{  
						 res.json({ msg:"Successfully registered"});
					})
					.catch((err)=>
					{
						console.log(err)
						res.json({ msg:"User Already Exist!!"})
					})
	}
	else
	{
    res.json({ msg:"Enter a valid detail || Password mismatch"})
	}
})

//getting todos
app.route('/todos').get((req,res)=>{
    toDoModel.find( {} )
		.then(function(data)
    {
		res.json(data);
      
      if(data === null)
      {
		res.end("No data")
      } 
      
    }).catch(function(err)
    {
        res.json({msg:err});	
        console.log(err)
    })

}).post((req,res)=>{
	const response=req.body
	console.log(response)
	const title=response.title;
	const status=response.status;
	const id=response.id;
					toDoModel.create(
						{
							title:title,
							status:status,
							id:id
						}
					)
					.then(()=>
					{  
						 res.end();
					})
					.catch((err)=>
					{
						console.log(err)
						
					})
})

//delete task
app.route('/delete').post((req,res)=>{
	const response=req.body
	const id=response.id
					toDoModel.deleteOne({id:id})
					.then((response1)=>
					{  
						 toDoModel.find({})
							.then((response2)=>{
                                res.send(response2)
							})
					})
					.catch((err)=>
					{
						console.log(err)
						
					})
})

//updateStatus
app.route(`/updated`).post((req,res)=>{
	const response=req.body
	const id=response.id
	let status=response.status
	console.log(status)
	console.log(id)
					toDoModel.updateOne({id:id},{$set:{status:status}})
					.then((response)=>
					{  
						 console.log(response)
						 res.end()
					})
					.catch((err)=>
					{
						console.log(err)
						
					})
})

//updateTask
app.route(`/updateTask`).post((req,res)=>{
	const response=req.body
	const id=response.id
	let title=response.title
	console.log(title)
	console.log(id)
					toDoModel.updateOne({id:id},{$set:{title:title}})
					.then((response)=>
					{  
						 console.log(response)
						 res.end()
					})
					.catch((err)=>
					{
						console.log(err)
						
					})
})

//register
app.post("/register", async (req, res) => {

	const {username,email,password}=req.body
	//Our register logic starts here
	try {
	// Get user input
	// Validate user input
	  if (!(email && password && username)) {
		console.log(email,password,username)
		res.status(400).send("All input is required");
	  }
	  // check if user already exist
	  // Validate if user exist in our database
	  const oldUser = await userModel.findOne({ email });
  
	  if (oldUser) {
		return res.status(409).send("User Already Exist. Please Login");
	  }
	  //Encrypt user password
	  encryptedPassword=await bcrypt.hash(password, 10);
  
	  // Create user in our database
	  const user = await userModel.create({
		username,
		email: email.toLowerCase(), // sanitize: convert email to lowercase
		password: encryptedPassword,
	  });
  
	  // Create token
	  const token = jwt.sign(
		{ user_id: user._id, email },
		process.env.TOKEN_KEY,
		{
		  expiresIn: "2h",
		}
	  );
	  // save user token
	  user.token = token;
  
	  // return new user
	//   res.status(201).json(user);
	res.render('login')
	} catch (err) {
		if(err.code===11000)
		{
			res.status(404).json("Username Exist , Please Try Another Username")
		}
	  console.log(err);
	}
	// Our register logic ends here
  });

  //login 
  app.post("/login", async (req, res) => {

	// Our login logic starts here
	try {
	  // Get user input
	  const { email, password } = req.body;
  
	  // Validate user input
	  if (!(email && password)) {
		res.status(400).send("All input is required");
	  }
	  // Validate if user exist in our database
	  const user = await userModel.findOne({ email });
  
	  if (user && (await bcrypt.compare(password, user.password))) {
		// Create token
		const token = jwt.sign(
		  { user_id: user._id, user:user.username },
		  process.env.TOKEN_KEY,
		  {
			expiresIn: "2h",
		  }
		);
  
		// save user token
		user.token = token;

		axios.post('http://localhost:3002/welcome',user)
		  .then(function (response) {
			res.render("toDo",{user:user.username})
		  })
		  .catch(function (error) {
		    console.log("Invalid Token")
			res.render('login')
		  });

		return;
	  }
	  res.status(400).json("Invalid Credentials");
	} catch (err) {
	  console.log(err);
	}
	// Our register logic ends here
  });

app.listen(PORT,()=>{
    console.log("Listening on",PORT)
})

