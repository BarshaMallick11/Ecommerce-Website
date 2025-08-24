// backend/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: "*"
}));

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

app.use('/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/profile', profileRouter);
app.use('/api/contact', contactRouter);
app.use('/api/users', usersRouter);
app.use('/api/settings', settingsRouter); // Add
app.use('/api/queries', queriesRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});