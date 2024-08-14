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
    let proObj={
      item:new objectId(proId),
      quantity:1
    }
    return new Promise(async(resolve,reject)=>{
      let userCart=await db.getDb().collection(collection.CART_COLLECTION).findOne({user: new objectId(userId)})
      if(userCart){
        let proExist=userCart.products.findIndex(product => product.item==proId)
        if(proExist!=-1){
          db.getDb().collection(collection.CART_COLLECTION).updateOne({user:new objectId(userId),'products.item':new objectId(proId)},
        {
          $inc:{'products.$.quantity':1}
        }).then(()=>{
          resolve()
        })
        }else
        {
        db.getDb().collection(collection.CART_COLLECTION).updateOne({user:new objectId(userId)},
      {
          $push:{products: proObj}
      }
    ).then((response)=>{
      resolve()
    })
  }
      }else{
        let cartObj={
          user:new objectId(userId),
          products:[proObj]
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
                  $unwind:'$products'
                },
                {
                  $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                  }
                },
                {
                  $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                  }
                },
                {
                  $project:{
                    item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                  }
                }
            ]).toArray();

            resolve(cartItems); // Resolve the promise with the cart items
        } catch (err) {
            console.error('Error fetching cart products:', err);
            reject(err); // Reject the promise if there's an error
        }
    });
},
  getCartCount :async (userId) => {
  try {
    const cart = await db.getDb().collection(collection.CART_COLLECTION).findOne({ user: new objectId(userId) });
    if (cart && Array.isArray(cart.products)) {
      return cart.products.length;
    } else {
      return 0;
    }
  } catch (error) {
    console.error('Error fetching cart count:', error);
    throw error;
  }
},
changeProductQuantity : (details) => {
  details.count = parseInt(details.count);
  details.quantity = parseInt(details.quantity);
  console.log(details.quantity)

  // Calculate the new quantity after applying the count
  const newQuantity = details.quantity + details.count;

  return new Promise((resolve, reject) => {
    const dbInstance = db.getDb();
    const cartId = new objectId(details.cart);
    const productId = new objectId(details.product);
    console.log(newQuantity)

    if (newQuantity <= 0) {
      // Remove the product from the cart if the new quantity is 0 or less
      dbInstance.collection(collection.CART_COLLECTION)
        .updateOne(
          { _id: cartId },
          { $pull: { products: { item: productId } } }
        )
        .then((response) => {
          resolve({ removeProduct: true });
        })
        .catch((error) => {
          reject({ error: 'Failed to remove product from cart', details: error });
        });
    } else {
      // Update the product quantity
      dbInstance.collection(collection.CART_COLLECTION)
        .updateOne(
          { _id: cartId, 'products.item': productId },
          { $inc: { 'products.$.quantity': details.count } }
        )
        .then((response) => {
          resolve(true);
        })
        .catch((error) => {
          reject({ error: 'Failed to update product quantity', details: error });
        });
    }
  });
},
getTotalAmount:(userId)=>{
  return new Promise(async (resolve, reject) => {
    try {
        let total = await db.getDb().collection(collection.CART_COLLECTION).aggregate([
            {
                $match: { user: new objectId(userId) } // Match the user's cart
            },
            {
              $unwind:'$products'
            },
            {
              $project:{
                item:'$products.item',
                quantity:'$products.quantity'
              }
            },
            {
              $lookup:{
                from:collection.PRODUCT_COLLECTION,
                localField:'item',
                foreignField:'_id',
                as:'product'
              }
            },
            {
              $project:{
                item:1,quantity:1,product:{$arrayElemAt:['$product',0]},
                productPrice: { $toDouble: { $arrayElemAt: ['$product.Price', 0] } }
              }
            },
            {
              $group:{
                _id:null,
                total:{$sum:{$multiply:['$quantity','$productPrice']}}
              }
            }
          
        ]).toArray();
        console.log(total[0].total)
        resolve(total[0].total); // Resolve the promise with the cart items
    } catch (err) {
        console.error('Error fetching cart products:', err);
        reject(err); // Reject the promise if there's an error
    }
});
}



};
