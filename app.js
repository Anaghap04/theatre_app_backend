const express = require('express');                                           
const app = express();  
const path = require('path'); 
 
const morgan = require('morgan');
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const cors = require('cors');
app.use(cors());
app.use(express.static('./dist/theatre-ticketing-application')); 
                                                 
const PORT = 3000; 

const db = require('./db/index');
const api=require('./routers/router');
app.use('/api',api);


app.get('/*', function(req, res) {
        res.sendFile(path.join(__dirname +
        '/dist/theatre-ticketing-application/index.html')) }); 
        
app.listen(PORT,()=>{                                                         
        console.log(`Server is running on ${PORT}`);                             
})