const mongoose = require('mongoose');
// User Collection
const Schema = mongoose.Schema({                                               
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name:{
        type:String,                                                         
     }
});

const documentData = mongoose.model('users',Schema);
module.exports = documentData;
