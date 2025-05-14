const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI); 

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('cinesearch'); 
    console.log('Connected to MongoDB');
  } catch (err) { 
    console.error('MongoDB connection error:', err);
    throw err; // Throw the error to stop the server if the connection fails
  }
}

// Check if the database is already connected.
function getDB() {
  if (!db) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return db;
}

module.exports = { connectDB, getDB };