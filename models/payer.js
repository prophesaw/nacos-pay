const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    full_name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    amount:{
        type:String,
        required:true
    },
    reference:{
        type:String,
        required:true
    },
    matric:{
        type:String,
        required:true
    }
},{timestamps:true})

const Payer = mongoose.model('Payer',schema);
module.exports = Payer;