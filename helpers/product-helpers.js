const db = require('../config/connection');
const collection = require('../config/collection');
const {connect} =require('../config/connection');
const { resolve } = require('path');
const objectId=require('mongodb').ObjectId

module.exports = {
  addProduct: async (product, callback) => {
    try {
      console.log('Adding product:', product);
      const db = await connect();
      const productCollection = db.collection('products');
      const result = await productCollection.insertOne(product);
      console.log('Product added with ID:', result.insertedId);
      callback(result.insertedId); // Pass the inserted ID to the callback
    } catch (err) {
      console.error('Failed to add product:', err);
      callback(null, err); // Pass null and the error to the callback
    }
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db.getDb().collection(collection.PRODUCT_COLLECTION).find().toArray();
      resolve(products);
    });
  },
  deleteProduct:(proId)=>{
    return new Promise((resolve,reject)=>{
    db.getDb().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:new objectId(proId)}).then((response)=>{
      resolve(response)
     })
  })
  }
}
