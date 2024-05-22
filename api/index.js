const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');//used for hashing the password
const app = express();

const jwt = require('jsonwebtoken');

const cookieParser = require('cookie-parser');//for '/profile get api'

//for uploadinig the content of post i.e title,summary,image etc in 'upload' folder
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');

const salt = bcrypt.genSaltSync(10);//used for hashing the password
const secret = 'asdfe45we45w345wegw345werjktjwertkj';
 
 
//as we have used credential in login page so need to make it true here
app.use(cors({credentials:true,origin:'http://localhost:3000'}));

app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect('mongodb+srv://l201305:YEpepijpaL7WCS7v@cluster0.00p3juv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
 

app.post('/register', async (req,res) => {
    const {username,password} = req.body;
    try{
      const userDoc = await User.create({
        username,
        password:bcrypt.hashSync(password,salt),
      });
      res.json(userDoc);
    } catch(e) {
      console.log(e);
      res.status(400).json(e);
    }
  });

  
const PORT = 4000;


app.listen(PORT, () => console.log(`Server is running successfully on PORT ${PORT}`));