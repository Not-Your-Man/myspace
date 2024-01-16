const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

const mongoURI = 'mongodb+srv://williamsmicheal237:%40Wrongman%21@cluster0.wmuc96c.mongodb.net/signup_db?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
  connectTimeoutMS: 30000,
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.json());

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the email already exists in the database
    const isEmailTaken = await User.exists({ email });
    if (isEmailTaken) {
      return res.status(400).json({ error: 'Email is already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/change-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await User.updateOne({ email }, { $set: { password: hashedPassword } });

    if (result.nModified > 0) {
      res.status(200).json({ message: 'Password changed successfully' });
    } else {
      res.status(404).json({ error: 'User not found or password unchanged' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
