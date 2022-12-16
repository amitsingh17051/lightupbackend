const express = require('express');
const router = express.Router();
const Idea = require('../models/IdeaSchema');

router.get('/idea',function(req,res){
    res.send({type: 'GET'});
});


router.post('/idea', function(req, res){
    res.send({
        type: 'POST',
        name: req.body.name,
        roll: req.body.description
    });
});

router.put('/idea/:id', function(req, res){
    res.send({type: 'PUT'});
});

router.delete('/idea/:id', function(req, res){
    res.send({type: 'DELETE'});
});

module.exports = router;