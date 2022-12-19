const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Schemas 
const Idea = require('../models/IdeaSchema');
const User = require('../models/userSchema');


// Midleware function 

function verifyJWTToken(req, res, next) {
    const token = req.headers['x-access-token']?.split(' ')[1];
    //console.log(req)
    if(token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
            if(err) return res.json({
                isLoggedIn: false,
                msg: "Failed To Authenticate"
            })

            req.user = [];
            req.user.id = decode.id;
            req.user.name = decode.name;
            next();
        })
    } else {
        res.json({msg:"Incorrect Token Given ee", isLoggedIn: false});
    }
}


// ------------------------------------------ IDEAS ROUTES -------------------------------------------------------
// Get all Ideas 
router.get('/idea',function(req,res){
    Idea.find(function(err, ideas) {
        if (err) return console.error(err);
        res.send(ideas);
    });
});

// Get single idea
router.get('/idea/:id', async function(req, res){
    try {
        const idea = await Idea.find({ _id: {$eq:req.params.id} });
        res.status(302).send({idea});
    } catch (error) {
        res.status(400).json({msg: "No Idea with this is!"});
    }
});

// Get user ideas
router.get('/idea/user/:id', async function(req, res){
    try {
        const userIdea = await Idea.find({ userId: {$eq:req.params.id} });
        res.status(302).send({userIdea});
    } catch (error) {
        res.status(400).json({msg: "No Idea found for this user!"});
    }
});


// Create Idea
router.post('/idea', async  function(req, res){
    try {
        const newidea = await Idea.create({
            name:req.body.name,
            description: req.body.description,
            userId: req.body.userId
        }) 
        newidea.save();
        res.status(301).json({data: req.body})
    } catch (error) {
        console.log(error.message);
    }

});

// Update Idea
router.put('/idea/:id', async function(req, res){
    try {
        const updateIdea = {
            name:req.body.name,
            description: req.body.description,
            userId: req.body.userId
        };
        await Idea.findOneAndUpdate({ _id: req.params.id}, updateIdea);
        res.status(301).json({data: req.body})
    } catch (error) {
        console.log(error.message);
    }
});

// Delete Idea
router.delete('/idea/:id', async function(req, res){
    try {
        await Idea.deleteOne({ _id: req.params.id })
    } catch (error) {
        res.status(400).send({msg:"Id is not valid"})
    }
    res.status(200).send({msg:"idead Deleted Sucessfully!"})
});



// ------------------------------------------ USERS ROUTES -------------------------------------------------------

router.get('/user',function(req,res){
    User.find(function(err, users) {
        if (err) return console.error(err);
        res.send(users);
    });
});

router.post('/user/username', verifyJWTToken, function(req,res){
   res.json({ isLoggedIn: true, name: req.user.name })
});


router.post('/user/login',function(req,res){

    const userLoggingIn = req.body;

    User.findOne({name:userLoggingIn.name})
    .then(dbUser => {
        if(!dbUser) {
            return res.json({
                msg:"Invalid Username or Password 33"
            })
        }


        bcrypt.compare(dbUser.password, userLoggingIn.password)
        .then(isCorrect => {
            if(!isCorrect) {
                const payload = {
                    id: dbUser._id,
                    name: dbUser.name
                }
                jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    {expiresIn: 86400},
                    (err, token) => {
                        console.log(err)
                        if(err) return res.json({msg:err})
                        return res.json({
                            message:"Success",
                            token:"Bearer " + token
                        })
                    }
                )
            } else {
                return res.json({
                    msg:"Invalid Username or Password 44"
                })
            }
        }) 
    })
    
   
});

// Create Idea
router.post('/user', async  function(req, res){
    try {

        const password = await bcrypt.hash(req.body.password, 10);
        const newUser = await User.create({
            name: req.body.name.toLowerCase(),
            email: req.body.email.toLowerCase(),
            password: password
        }) 
        newUser.save();
        res.status(301).json({data: req.body})
    } catch (error) {
        console.log(error.message);
    }

});

// Update Idea
router.put('/user/:id', async function(req, res){
    try {
        const updateUser= {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        };
        await User.findOneAndUpdate({ _id: req.params.id}, updateUser);
        res.status(301).json({data: req.body})
    } catch (error) {
        console.log(error.message);
    }
});

// Delete Idea
router.delete('/user/:id', async function(req, res){
    try {
        await User.deleteOne({ _id: req.params.id })
    } catch (error) {
        res.status(400).send({msg:"Id is not valid"})
    }
    res.status(200).send({msg:"User Deleted Sucessfully!"})
});


module.exports = router;