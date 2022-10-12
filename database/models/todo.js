const mongoose = require("mongoose");

const toDoSchema = new mongoose.Schema({
 title:{
   type:String,
   required:true,
   
 },
 status:
 {
  type:String,
  required:true
 },
 id:{
    type:String,
    unique:true,
    required:true
 },
 added_by:
{ 
    type: String,
    default:null
 },
},
 )

 const toDoModel = mongoose.model('Todos', toDoSchema);

 module.exports=toDoModel