require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');


const requireAuth = (req,res,next)=>{
    const token = req.cookies.user;

    if(token){
       jwt.verify(token,process.env.JWT_KEY,(err,decodedToken)=>{
        if(err){
            res.redirect('/login');
        }else{
            next()
        }
       })
    }else{
        res.redirect('/login');
    }
}

const checkUser = (req,res,next)=>{
    const token = req.cookies.user;
    if(token){
        jwt.verify(token,process.env.JWT_KEY,async(err,decodedToken)=>{
            if(err){
                res.locals.user = null;
                next();
            }else{
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        })
    }else{
        res.locals.user = null;
        next();
    }
}

module.exports ={
    requireAuth,
    checkUser
}
