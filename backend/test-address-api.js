const axios = require('axios');

async function testAddressAPI() {
    try {
        const response = await axios.post('http://localhost:5000/api/profile/address', {
            name: "Barsha Mallick",
            address: "Deshbondhupara",
            city: "Siliguri",
            district: "Darjeeling",
            state: "West bengal",
            postalCode: "734004",
            country: "India",
            phoneNo: "9641648838"
        }, {
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YWIyNGFkYmY0NmIxYmVhNTI0OTA3NyIsImlhdCI6MTc2OTAyMDcxNX0.ovuaboGa54BRpjNI0EGXukDH_pfTrLV4kqZLT8-jyos',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Success:', response.data);
    } catch (error) {
        console.log('Error Status:', error.response?.status);
        console.log('Error Data:', error.response?.data);
        console.log('Error Message:', error.message);
    }
}

testAddressAPI();