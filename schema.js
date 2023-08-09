const mongoose=require("mongoose");

const productschema= new mongoose.Schema({
    username:{
     type:String,
     unique:true
    },
    email:{
     type:String,
     unique:true
    },
    password:{
     type:String,
    },
    confirmpassword:{
     type:String
    }
 });
 
 const productmodel= new mongoose.model('datas',productschema);

 module.exports=productmodel;