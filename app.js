const express = require('express');
require('dotenv').config();
const routes = require('./routes/userRoute')
const app = express();
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: false}))

mongoose.connect(process.env.DB_URL,{useNewUrlParser:true,useUnifiedTopology:true})
.then((result)=> app.listen(process.env.PORT))
.catch((err)=> console.log(err));



app.use(routes);