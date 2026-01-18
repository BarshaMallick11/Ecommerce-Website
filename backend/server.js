// backend/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri)
  .then(() => console.log("MongoDB database connection established successfully"))
  .catch(err => console.error("MongoDB connection error:", err));
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const paymentRouter = require('./routes/payment');
const ordersRouter = require('./routes/orders');
const usersRouter = require('./routes/users');
const profileRouter = require('./routes/profile');
const contactRouter = require('./routes/contact');
const settingsRouter = require('./routes/settings'); // Add
const queriesRouter = require('./routes/queries');
const shippingRouter = require('./routes/shipping');
const pincodesRouter = require('./routes/pincodes');
const coverageRouter = require('./routes/coverage');
const upiPaymentRouter = require('./routes/upiPayment');
const categoriesRouter = require('./routes/categories');
const bannersRouter = require('./routes/banners');

console.log('Banners router loaded successfully');

app.use('/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/auth', authRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/profile', profileRouter);
app.use('/api/contact', contactRouter);
app.use('/api/users', usersRouter);
app.use('/api/settings', settingsRouter); // Add
app.use('/api/queries', queriesRouter);
app.use('/api/shipping', shippingRouter);
app.use('/api/pincodes', pincodesRouter);
app.use('/api/coverage', coverageRouter);
app.use('/api/upi-payment', upiPaymentRouter);
app.use('/api/banners', bannersRouter);
console.log('Banners route registered at /api/banners');

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');

  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // Handle React routing - return all requests to React app
  // This MUST be after all API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});