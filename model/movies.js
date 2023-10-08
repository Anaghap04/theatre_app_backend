const mongoose = require('mongoose');
// Movie Collection
const Schema = mongoose.Schema({                                               
    moviename: { 
        type: String, required: true 
    },
    language:{
        type:String, required: true                                                       
     },
    category:{
        type:String, required: true                                                       
    },
    cast:{
        type:String, required: true                                                       
    },
    description:{
        type:String, required: true                                                       
    },
    ticket_rate:{
        type:String, required: true                                                       
    },
    seats:{
        type:Number, required: true                                                       
    },
    image: { 
        data: Buffer,
        contentType : String
        // required: true 
    },
    timeSlots:{
        type: [], required: true                                                       
     },
    rating: [
        {
            user: String,
            reviewText: String,
            starRating: Number,
        },
    ]
});

const movieData = mongoose.model('movies',Schema);
module.exports = movieData;
