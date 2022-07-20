const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const route = require('./routes/route.js');

const app = express();


app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));


try{
    mongoose.connect("mongodb+srv://vinayrathore45:vinay123@cluster0.euhc6tm.mongodb.net/group13Database",{useNewUrlParser:true})
    console.log("MongoDB is connected")
}
catch (error){
    console.log(error)
}
app.use("/",route)
app.listen(3000, console.log('Express app running on port 3000'))