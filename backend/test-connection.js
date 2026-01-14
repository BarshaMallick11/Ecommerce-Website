// Test MongoDB connection
require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.ATLAS_URI;

console.log('Testing MongoDB connection...');
console.log('Connection string (password hidden):', uri.replace(/:[^:@]+@/, ':****@'));

mongoose.connect(uri)
    .then(() => {
        console.log('✅ SUCCESS! MongoDB connection established successfully');
        mongoose.connection.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ FAILED! MongoDB connection error:');
        console.error('Error code:', err.code);
        console.error('Error message:', err.message);

        if (err.code === 8000) {
            console.log('\n🔧 SOLUTION: Your MongoDB Atlas credentials are incorrect.');
            console.log('Please check:');
            console.log('1. Go to MongoDB Atlas (https://cloud.mongodb.com)');
            console.log('2. Navigate to Database Access');
            console.log('3. Verify the username "barshamallick1108" exists');
            console.log('4. If needed, edit the user and reset the password');
            console.log('5. Update the ATLAS_URI in your .env file with the correct password');
            console.log('6. Remember to URL-encode special characters (@ = %40, # = %23, etc.)');
        }

        process.exit(1);
    });
