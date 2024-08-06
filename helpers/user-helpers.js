const db = require('../config/connection');
const collection = require('../config/collection');
const bcrypt = require('bcrypt');

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('Hashing password for:', userData); // Log before hashing
        userData.Password = await bcrypt.hash(userData.Password, 10);
        console.log('Password hashed:', userData.Password); // Log after hashing

        const result = await db.getDb().collection(collection.USER_COLLECTION).insertOne(userData);
        resolve(result.insertedId);
      } catch (error) {
        console.error('Error during signup:', error); // Log the error
        reject(error);
      }
    });
  },

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      try {
        let user = await db.getDb().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email });
        if (user) {
          bcrypt.compare(userData.Password, user.Password).then((status) => {
            if (status) {
              console.log("Login success");
              response.user = user;
              response.status = true;
              resolve(response);
            } else {
              console.log("Invalid login details");
              response.status = false;
              resolve(response);
            }
          });
        } else {
          console.log("User not found");
          response.status = false;
          resolve(response);
        }
      } catch (error) {
        console.error('Error during login:', error); // Log the error
        reject(error);
      }
    });
  }
};
