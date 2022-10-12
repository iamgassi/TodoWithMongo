const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String,unique:true },
  email: { type: String, unique: true },
  password: { type: String },
  token: { type: String },
},
 )

 const userModel = mongoose.model('User', userSchema);

 module.exports=userModel