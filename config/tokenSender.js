const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

module.exports.verifyMail = (reciever,sender,next)=>{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.PASSWORD
        }
    });
      
    const token = jwt.sign({
           reciever  
        }, 'ourSecretKey', { expiresIn: '10m' }  
    );    
      
    const mailConfigurations = {
      
        // It should be a string of sender/server email
        from: sender,
      
        to: reciever,
      
        // Subject of Email
        subject: 'Email Verification',
          
        // This would be the text of email body
        text: `Hi! There, You have recently visited 
               our website and entered your email.
               Please follow the given link to verify your email
               http://localhost:4000/email/verify/${token} 
               Thanks`
          
    };
      
    transporter.sendMail(mailConfigurations,  async function(error, info){
        if (error){ 
            await User.deleteOne({email:reciever})
            
        }
        console.log('Email Sent Successfully');
        console.log(info);
        next();
    });
}