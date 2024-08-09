const db = require('../config/connection');
const collection = require('../config/collection');
const bcrypt = require('bcrypt');
const { response } = require('express');
const objectId=require('mongodb').ObjectId

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
  },
  addToCart:(proId,userId)=>{
    return new Promise(async(resolve,reject)=>{
      let userCart=await db.getDb().collection(collection.CART_COLLECTION).findOne({user: new objectId(userId)})
      if(userCart){
        db.getDb().collection(collection.CART_COLLECTION).updateOne({user:new objectId(userId)},
      {
          $push:{products: new objectId(proId)}
      }
    ).then((response)=>{
      resolve()
    })
      }else{
        let cartObj={
          user:new objectId(userId),
          product:[new objectId(proId)]
        }
        db.getDb().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
          resolve()
        })
      }
    })
  },
  getCartProducts:(userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let cartItems = await db.getDb().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: new objectId(userId) } // Match the user's cart
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION, // The collection to join with
                        let: { proList: '$products' }, // 'product' should be an array of product IDs
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ['$_id', '$$proList'] // Match products in the 'product' array
                                    }
                                }
                            }
                        ],
                        as: 'cartItems' // Store the joined products in 'cartItems'
                    }
                }
            ]).toArray();

            resolve(cartItems[0].cartItems); // Resolve the promise with the cart items
        } catch (err) {
            console.error('Error fetching cart products:', err);
            reject(err); // Reject the promise if there's an error
        }
    });
}

};
