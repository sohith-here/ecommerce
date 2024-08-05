const { resolve } = require('path');
const db = require('../config/connection')
const {connect} = require('../config/connection')
const collection = require('../config/collection');


module.exports = {
    addProduct:async (product, callback) => {
       try {  console.log('Adding product:', product);
        const db = await connect();
        const collection = db.collection('products'); // Access the collection
         await collection.insertOne(product).then((data)=>{
          // console.log(data);
         // Insert the document
        
        console.log('Product added');
        callback(data._insertedId); // Pass the result to the callback, success
    })}
        // Ensure the database connection is available
    
            catch(err) {
                console.error('Failed to add product:', err);
                callback(err); // Pass the error to the callback
            }
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products= await db.getDb().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    }
}

