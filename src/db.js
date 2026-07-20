const mongoose = require('mongoose');
const { MONGODB_URI } = process.env;

async function connectDB(uri) {
  if (!uri) throw new Error('MONGODB_URI is required');
  await mongoose.connect(uri, { dbName: 'membersplus' });
  console.log('MongoDB connected');
}

module.exports = { connectDB, mongoose };
