const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {isEmail} = require('validator')

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email:{
        type: String,
        required:[true,'please enter an email'],
        unique:true,
        lowercase:true,
        validate:[isEmail,'please enter a valid email']
    },
    password:{
        type: String,
        required:[true,'please enter a password'],
        minlength:[6,'password should not be less than six character']
    },
    verified:{
        type: String,
        default:'0'
    }
},{timestamps:true});

userSchema.pre('save', async function(next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password,salt);
    next();
});

userSchema.statics.login = async function(email,password){
    const user = await this.findOne({email});
    const verified = user.verified;
    if(user){
        console.log(verified);
       if(verified == '1'){
        const auth = await bcrypt.compare(password,user.password);
        if(auth){
          return user;
        }
        throw Error('incorrect password');
       }
       throw Error('User not verified');
    }
    throw Error('incorrect email');
}



const User = mongoose.model('User',userSchema);
 module.exports = User;