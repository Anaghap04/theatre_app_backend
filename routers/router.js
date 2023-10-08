const express = require('express');
const router = express.Router();
const jwt=require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const userData=require("../model/users");
const movieData=require("../model/movies");
const bookingData=require("../model/booking");

router.use(express.json());
router.use(express.urlencoded({extended:true}));

const storage = multer.memoryStorage();

const upload=multer({storage:storage})

// function to verify token
function verifytoken(req, res, next) {
  try {
    if (!req.headers.authorization) throw 'Unauthorized';
    let token = req.headers.authorization.split(' ')[1];
    if (!token) throw 'Unauthorized';
    let payload = jwt.verify(token, 'secretKey');
    if (!payload) throw 'Unauthorized';
    next();
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
}

// Api for Admin Login
  router.post('/adminlogin', (req, res) => {
    try {      
        var email = req.body.email;
        var password = req.body.password;
      
        // Send the token in the response
        if (email === 'admin@gmail.com' && password === 'admin@123') {
        const token = jwt.sign({ email, password }, 'secretKey');

          res.status(200).send({ message: 'Admin logged in Successful', token: token, role:'admin' })
          console.log('Admin logged in Successful')
        } else {
          res.status(400).send({message:'Unauthorized'});
        }
      } catch (error) {
        res.status(404).send({message:'Not found'});
    }
  });


  // Api for Customer Login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const customer = await userData.findOne({ email, password });
      if (email === 'admin@gmail.com' && password === 'admin@123') {
        const token = jwt.sign({ email, password }, 'secretKey');

          res.status(200).send({ message: 'Admin logged in Successful', token: token, role:'admin' })
          console.log('Admin logged in Successful')
        }
      else if (customer) {
        const token = jwt.sign({ email, password }, 'secretKey');
        res.status(200).json({ message: 'Customer login successful.', token: token, role:'user', user:email });
      } else {
        res.status(400).json({ error: 'Invalid credentials.' });
      }
    } catch (error) {
      res.status(404).json({ error: 'Internal Server Error' });
    }
  
  });

  // Api for Customer Signup
  router.post('/signup', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const customer = new userData({ name, email, password });
      await customer.save();
      const token = jwt.sign({name, email, password }, 'secretKey');

      res.status(200).json({ message: 'Customer signup successful.',token:token });
      console.log('Customer signup successful.')
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
      console.log('Internal Server Error')
    }
  });

 // Get All movie list - Customer
 router.get('/movielist',verifytoken, async (req, res) => {
  try{
    const movies=await movieData.find();
    res.status(200).json(movies);
  }catch(err){
      res.status(500).json({error:'Failed to fetch image'});
  }
});

// get movie details
router.get('/get-movie-details/:id',verifytoken, (req, res) => {
  const id = req.params.id;

  movieData.findById(id)
    .then((data) => {
      if (!data) {
        return res.status(404).json({ error: 'Data not found' });
      }
      res.json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Error retrieving data' });
    });
});

// add movie details - Admin
router.post('/addmovie', verifytoken, upload.single('image'), async (req, res) => {
  try {
    const {
      moviename, language, category, cast, description, ticket_rate, seats, timeSlots
    } = req.body;

    const movie = new movieData({
      moviename, language, category, cast, description, ticket_rate, seats, timeSlots,
      image : {
        data : Buffer.from(req.file.buffer),
        contentType : req.file.mimetype
      }
    });

    // Save the movie data to the database
    await movie.save();

    res.status(200).json('Movie Added');
    console.log('Movie Added');
  } catch (error) {
    res.status(400).json('Cannot Add data');
    console.error('Cannot Add data', error);
  }
});

// Update movie details - Admin
router.put('/update-movie/:id', verifytoken, (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  movieData.findByIdAndUpdate(id, { $set: updatedData }, { new: true })
    .then((updated) => {
      res.json(updated);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Error updating movie' });
    });
});

//   delete a Movie - Admin
router.delete('/delete-movie/:id',verifytoken, (req, res) => {
  const id = req.params.id;

  movieData.findByIdAndRemove(id)
    .then((removedData) => {
      if (removedData) {
        console.log('Movie deleted successfully:', removedData);
        res.json({ message: 'Movie deleted successfully' });
      } else {
        res.status(404).json({ error: 'Movie not found' });
      }
    })
    .catch((err) => {
      console.error('Error deleting movie:', err);
      res.status(500).json({ error: 'Error deleting movie' });
    });
});

// API Endpoint to Book a Ticket
router.post('/bookTicket',verifytoken, (req, res) => {
  const { moviename, date, tickets, amount, email, time, movieId } = req.body;

  // Save booking to MongoDB
  const newBooking = new bookingData({ moviename, date, tickets, amount, email, time, movieId });
  newBooking.save()
  .then(() => {
    // Send confirmation email
    sendConfirmationEmail(email, tickets);
    res.status(200).send('Ticket booked successfully.');
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error booking ticket.');
  });
});

// Email Sending Function
const sendConfirmationEmail = (email, tickets) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'anaghatcr1999@gmail.com',
      pass: 'lprjqhhivxorbxuw',
    },
  });

  const mailOptions = {
    from: 'anaghatcr1999@gmail.com',
    to: email,
    subject: 'Ticket Booking Confirmation',
    text: `Your ticket has been booked. Seat Number: ${tickets}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

// Get booking details by email - customer
router.get('/get-booking-details/:email',verifytoken, async(req, res) => {
  const email = req.params.email;

  try {
    const data = await bookingData.find({ email });

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No data found for the provided email' });
    }

    res.json(data);
  } catch (err) {
    console.error('Error retrieving data', err);
    res.status(500).json({ error: 'Error retrieving data' });
  }
});

// get bookings by id - customer
router.get('/get-bookings/:id',verifytoken, (req, res) => {
  const id = req.params.id;

  bookingData.findById(id)
    .then((data) => {
      if (!data) {
        return res.status(404).json({ error: 'Data not found' });
      }
      res.json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Error retrieving data' });
    });
});

//   Cancel tickets - Customer
router.delete('/cancel-tickets/:id',verifytoken, (req, res) => {
  const id = req.params.id;

  bookingData.findByIdAndRemove(id)
    .then((removedData) => {
      if (removedData) {
        console.log('Ticket cancelled successfully:', removedData);
        res.json({ message: 'Ticket cancelled successfully' });
      } else {
        res.status(404).json({ error: 'Ticket not found' });
      }
    })
    .catch((err) => {
      console.error('Error cancelling movie:', err);
      res.status(500).json({ error: 'Error cancelling movie' });
    });
});

router.get('/soldseats/:movieId', async (req, res) => {
  try {
    const movieId = req.params.movieId;

    // Fetch the list of sold seats for the specified movie
    const soldSeats = await getSoldSeatsForMovie(movieId);

    res.status(200).json(soldSeats);
  } catch (error) {
    console.error('Error fetching sold seats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to get sold seats for a specific movie
async function getSoldSeatsForMovie(movieId) {
  try {
    // Assuming you have a 'bookings' collection in your MongoDB
    // You can customize this query based on your actual schema
    const soldSeats = await bookingData.find({ movieId }).distinct('seat_number');

    return soldSeats;
  } catch (error) {
    console.error('Error fetching sold seats:', error);
    return []; // Return an empty array in case of an error
  }
}

// Add Movie Rating
router.post('/movie-rating/:movieId', async (req, res) => {
  const { user, reviewText, starRating } = req.body;
  const { movieId } = req.params;

  try {
    const movie = await movieData.findByIdAndUpdate(
      movieId,
      {
        $push: {
          rating: {
            user: user,
            reviewText,
            starRating,
          },
        },
      },
      { new: true }
    );

    if (!movie) {
      res.status(404).send('Movie not found');
      return;
    }

    res.status(200).send('Rating updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating rating');
  }
});



module.exports = router
