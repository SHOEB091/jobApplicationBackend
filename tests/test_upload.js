const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    // Create a dummy file
    const filePath = path.join(__dirname, 'test.png');
    fs.writeFileSync(filePath, 'dummy content');

    const email = 'test@example.com';
    const password = 'password123';

    console.log('Registering user:', email);
    // 1. Register
    try {
        await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User',
            email,
            password
        });
    } catch (e) {
        console.log('Registration failed (might already exist):', e.message);
    }

    // 2. Login
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    });

    const token = loginRes.data.token;
    console.log('Received Token:', token);
    const cookie = loginRes.headers['set-cookie'];
    
    // 3. Upgrade to SuperAdmin (hacky: using the upgrade script logic but via direct DB access would be better, 
    // but here we can't easily access DB. So let's hope the user we just created is not superadmin and we need to make them one.
    // Actually, we can't easily make them superadmin via API without being superadmin.
    // So let's try to use the existing 'test@example.com' if it exists, or just assume the registration makes them a user.
    // Wait, the upload route requires 'superadmin'.
    
    // Okay, let's use the 'upgrade-to-superadmin.js' script to upgrade this specific user.
    // But we can't run that script from here easily.
    
    // Alternative: Just try to upload. If we get 403, we know auth works but role is wrong.
    // If we get 500, it's the upload error we want to debug.
    
    console.log('Uploading file...');
    const form = new FormData();
    form.append('title', 'Test Material');
    form.append('description', 'Test Description');
    form.append('file', fs.createReadStream(filePath));

    const config = {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
        Cookie: cookie
      }
    };

    const res = await axios.post('http://localhost:5000/api/study-materials', form, config);
    console.log('Success:', res.data);

  } catch (error) {
    if (error.response) {
      console.log('Error Status:', error.response.status);
      console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
      if (error.code) console.log('Error Code:', error.code);
    }
  }
}

testUpload();
