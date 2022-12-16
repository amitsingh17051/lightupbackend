const express = require("express");
const path = require("path");
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || "8000";


mongoose.connect('mongodb+srv://root:root@cluster0.iagif.mongodb.net/?retryWrites=true&w=majority');
mongoose.Promise = global.Promise;
app.use(express.static('public'));
app.use(express.json());

app.use('/api',require('./router/api'));



app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});