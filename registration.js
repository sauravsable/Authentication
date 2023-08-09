const express=require("express");
var nodemailer = require("nodemailer");
const otpGenerator=require("otp-generator");
const otp=otpGenerator.generate(6, { upperCaseAlphabets: true, specialChars: false });
const hbs=require("hbs");

const mongoose=require("mongoose");
mongoose.connect('mongodb://127.0.0.1:27017/registration');
const productmodel=require("./schema");

const path=require("path");
const app=express();

const bp=require("body-parser");
app.use(bp.urlencoded({extended:true}));

const filepath=path.join(__dirname,"public");
app.use(express.static(filepath));

const viewpath=path.join(__dirname,"/templates/views");
const partialpath=path.join(__dirname,"/templates/partials");
app.set("view engine","hbs");
app.set("views",viewpath);
hbs.registerPartials(partialpath);

app.get("/",(req,res)=>{
    res.render("index");
});

app.get("/login",(req,res)=>{
    res.render("form");
});

app.get("/reset",(req,res)=>{
    res.render("reset");
});

app.get("/otpgene",(req,res)=>{
    res.render("otpgene");
});

app.get("/newpass",(req,res)=>{
    res.render("newpass");
})

app.post("/",async(req,res)=>{
    try{
        const password=req.body.password;
        const confirmpassw=req.body.confirmpassword;

        if(password===confirmpassw){
            const data={
                username:req.body.username,
                email:req.body.email,
                password:req.body.password,
                confirmpassword:req.body.confirmpassword
            }
            const data1=new productmodel(data);
            const data2= await data1.save();
            res.redirect("next");
        }
        else{
            res.send("Please Enter Correct Data");
        }
    }
    catch (error){
        res.status(400).send(error);
    } 
})

app.post("/login",async(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;

    const useremail= await productmodel.findOne({email});
    if(useremail.password===password){
        res.redirect("next1");
    }
    else{
        res.send("Invalid Email or Password");
    }
})

let resetmail;
app.post("/reset",async(req,res)=>{
    const recemail=req.body.email;
    resetmail=recemail;
    var transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
            user:"",
            pass:"",
        }
    });
     
    var mailoption={
        from:process.env.EMAIL,
        to:recemail,
        subject:"Reset Password",
        text:otp
    };
    
    transporter.sendMail(mailoption,function(err,info){
        if(!err)
        {
            console.log(otp);
            res.redirect("otpgene");
        }
        else
        {
            console.log("error");
        }
    })
});

app.post("/otpgene",(req,res)=>{
  const otpin=req.body.inputotp;
  console.log(otpin);
  
  if(otpin==otp){
    res.redirect("newpass");
  }
  else{
    res.send("Incorrect OTP");
  }
});

app.post("/newpass",async(req,res)=>{
    // const email=req.body.email;
    const newpass=req.body.password;
    const conpass=req.body.confirmpassword;

    if(conpass===newpass){
    const data1 = await productmodel.updateOne(
        {email:resetmail},
        {$set:{password:newpass}
    });
    res.send("Password Update Successfully!!");
    
  }
});

app.listen(3000,()=>{
console.log("server started");
});
