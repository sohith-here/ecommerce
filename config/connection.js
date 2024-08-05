const { MongoClient } = require('mongodb');

const url = 'mongodb://127.0.0.1:27017'; // Replace with your MongoDB connection URL
const dbName = 'fasttohome'; // Replace with your database name

let db = null;

async function connect() {
    if (db) return db; // Return existing connection if already connected

    try {
        const client = new MongoClient(url);
        await client.connect();
        console.log('Connected successfully to MongoDB');
        db = client.db(dbName); // Select the database
        return db;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

function getDb() {
    if (!db) {
        throw new Error('Database not connected');
    }
    return db;
}

module.exports = { connect, getDb };



    

