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

  
app.post('/login', async (req,res) => {
    const {username,password} = req.body;
    //find a user with the entered username
    const userDoc = await User.findOne({username});
    //match the password for the fined user
    const passOk = bcrypt.compareSync(password, userDoc.password);

    if (passOk) {
      // logged in
      jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
        if (err) throw err;
        res.cookie('token', token).json({
          id:userDoc._id,
          username,
        });
      });
    } else {
      res.status(400).json('wrong credentials');
    }
  });


  app.put('/post',uploadMiddleware.single('file'), async (req,res) => {
    let newPath = null;
    if (req.file) {
      const {originalname,path} = req.file;
      const parts = originalname.split('.');
      const ext = parts[parts.length - 1];
      newPath = path+'.'+ext;
      fs.renameSync(path, newPath);
    }
  
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err,info) => {
      if (err) throw err;
      const {id,title,summary,content} = req.body;
      const postDoc = await Post.findById(id);
      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
      if (!isAuthor) {
        return res.status(400).json('you are not the author');
      }
      await postDoc.updateOne({
        title,
        summary,
        content,
        cover: newPath ? newPath : postDoc.cover,
      });
      res.json(postDoc);
    });
  });
  

app.get('/profile', (req,res) => {
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, (err,info) => {
      if (err) throw err;
      res.json(info);
    });
  });

  app.post('/logout', (req,res) => {
    res.cookie('token', '').json('ok');
  });

  
app.post('/post', uploadMiddleware.single('file'), async (req,res) => {
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];//entension of file
    const newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
  
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err,info) => {
      if (err) throw err;
       const {title,summary,content} = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover:newPath,
      author:info.id,
    });
    res.json(postDoc);
  });
    });

//  Delete API  
app.delete('/delete', uploadMiddleware.single('file'), async (req, res) => {
    console.log("In del api");
    
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err,info) => {
      if (err) throw err;

      const {userid,postid} = req.body;
      const postDoc = await Post.findById(postid);
    console.log(postDoc);
      await Post.findByIdAndDelete(postid);
      res.json(postDoc);
    });
  });

  
  app.get('/post', async (req,res) => {
    res.json(
      await Post.find()
        .populate('author', ['username'])
        .sort({createdAt: -1})
        .limit(20)
    );
  });
  
app.get('/post/:id', async (req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
  })
  
  
const PORT = 4000;


app.listen(PORT, () => console.log(`Server is running successfully on PORT ${PORT}`));