
const User = require('../models/userModel');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const request = require('request');
const time = 1*60*60*24;
const{initializePayment, verifyPayment} = require('../config/paystack')(request);
const Payer = require('../models/payer');
const _ = require('lodash');
const {sendMail} = require('../config/tokenSender');
const Token = require('../models/token');


//handling errors
const handleErrors = (err)=>{
  let errors = {email:'',password:''};

  if(err.code === 11000){
    errors.email = 'that email is already registered';
  }

  //validate err
  if(err.message.includes('User validation failed')){
    Object.values(err.errors).forEach(({properties}) =>{
        errors[properties.path] = properties.message;
    })
  }

  if (err.message.includes('incorrect password')){
    errors.password ='password not correct';
  }

  if (err.message.includes('incorrect email')){
    errors.email ='email not correct';
  }



  return errors;
}
//end of error handling

//jwt creation function
const time2 = 60*60;
const createToken = (id)=>{
    return jwt.sign({id},process.env.JWT_KEY,{expiresIn:time});
}
const verifyToken = (email)=>{
  return jwt.sign({email},process.env.JWT_KEYS,{expiresIn:time2});
}
//end of jwt

const home = (req,res)=>{
    res.render('index');
}

const dashBoard = (req,res)=>{
    res.render('dashboard');
}

const loginGet = (req,res)=>{
    res.render('login');
}

const loginPost = async (req,res)=>{
  const {email,password} = req.body;

  try {
    const user = await User.login(email,password);
    const token = createToken(user._id);
    res.cookie('user',token,{httpOnly:true,maxAge:time*1000});
    res.status(201).json({user:user._id});
  } catch (err) {
    const error = handleErrors(err);
    res.status(400).json({error});
  }
}

const signupGet = (req,res)=>{
    res.render('signup');
}

const signupPost = async (req,res)=>{
   const {email,password} = req.body;
   try {
    const user = await User.create({email,password});
    const token = verifyToken(user.email);
    res.cookie('verify',token,{httpOnly:true,maxAge:time2*1000});
    const message = `${process.env.BASE_URL}/email/verify/${token}`;
    await sendMail(user.email,'Verify Email',message);
    res.status(201).json({user:user._id});
   } catch (err) {
    const error = handleErrors(err);
    res.status(400).json({error})
   }
}

const logoutGet = (req,res)=>{
   res.cookie('user','',{maxAge:1});
   res.redirect('/')
}

const payGet =(req,res)=>{
  res.render('payDemo');
}

const payPost = (req,res)=>{
  const form = _.pick(req.body,['amount','email','full_name','matric']);

  form.metadata = {
    full_name:form.full_name,
    matric:form.matric
  }

   form.amount *= 100;
   //console.log(form)

 initializePayment(form,(error,body)=>{
   if(error){
    console.log(error);
    return;
   }
   let response = JSON.parse(body);
   res.redirect(response.data.authorization_url);
   
 });  
}
const payVerify = (req,res)=>{
  const ref = req.query.reference;
  verifyPayment(ref,(error,body)=>{
   if(error){
     console.log(error);
     return res.redirect('/errror');
   }
   let response = JSON.parse(body);
    

   const data = _.at(response.data, ['reference', 'amount','customer.email', 'metadata.full_name','metadata.matric']);
   [reference, amount, email, full_name,matric] = data;
   const newPayer = {reference, amount, email, full_name,matric};
   const payer = new Payer(newPayer);
   payer.save()
   .then((payer)=>{
     if(payer){
      res.redirect('/reciept/'+payer._id);
     }
   })
   .catch((err)=>{
    console.log(err)
     res.redirect('/error');
   });
  });
}

const reciept = (req,res)=>{
    const id = req.params.id;
    Payer.findById(id)
    .then((payer)=>{
      if(!payer){
        res.redirect('/error');
      }
      let isoDate = payer.createdAt.toString();
      let date = isoDate.split("T")[0];

      res.render('success',{payer,date});
    })
}

const emailVerification = async(req,res)=>{
 const cookie = req.cookies.verify;
 const token = req.params.token;
 if(token){
  jwt.verify(cookie,process.env.JWT_KEYS,async function(err,decodedToken){
    if(err){
      res.send('invalid link');
    }
    const user = await User.findOne({email:decodedToken.email});
    if(user){
      const token1 = createToken(user._id);
      res.cookie('user',token1,{httpOnly:true,maxAge:time*1000});
      res.status(201).json({user:user._id});
      await User.updateOne({ _id: user._id, verified: true });
    }
   })
 }

}

module.exports = {
    home,
    dashBoard,
    loginGet,
    loginPost,
    signupGet,
    signupPost,
    logoutGet,
    payGet,
    payPost,
    payVerify,
    reciept,
    emailVerification
}