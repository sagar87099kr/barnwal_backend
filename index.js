const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ override: true });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const productRoutes = require('./routes/products');
const billRoutes = require('./routes/bills');

app.use('/api/products', productRoutes);
app.use('/api/bills', billRoutes);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/barwnal-trader-local';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to database:', mongoose.connection.host, mongoose.connection.name);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Barwnal Trader API is running');
});
