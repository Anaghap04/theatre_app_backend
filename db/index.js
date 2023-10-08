const mongoose=require('mongoose');
mongoose.connect('mongodb+srv://Anagahp:Anagha001@cluster0.q3mgyhu.mongodb.net/Theatre_ticketing_app?retryWrites=true&w=majority')

.then(()=>{
    console.log(`Connection to Database established`);
})
.catch((error)=>{
    console.log(`Error in connecting to database ${error.message}`)
})