var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
var path = require('path');

/* GET users listing. */
router.get('/', function (req, res, next) {
  productHelpers.getAllProducts().then((products) => {
    res.render('admin/view_products', { admin: true, products });
  });
});

router.get('/add-product', function (req, res) {
  res.render('admin/add-product');
});

router.post('/add-product', function (req, res) {
  productHelpers.addProduct(req.body, (id, err) => {
    if (err) {
      res.send("Failed to add product");
      return;
    }
    console.log('Product ID:', id);
    if (req.files && req.files.Image) {
      let image = req.files.Image;
      const uploadPath = path.join(__dirname, '../public/product-images', `${id}.jpeg`);
      image.mv(uploadPath, (err) => {
        if (!err) {
          res.redirect('/admin');
        } else {
          res.send("Failed to upload image");
        }
      });
    } else {
      res.send("No image provided");
    }
  });
});
router.get('/product-delete/:id',(req,res)=>{
let proId=req.params.id
productHelpers.deleteProduct(proId).then((response)=>{
  res.redirect('/admin/')
})
})
router.get('/edit-product/:id',async(req,res)=>{
let product= await productHelpers.getProductDetails(req.params.id)
res.render('admin/edit-product',{product})
})
router.post('/edit-product/:id', (req, res) => {
  const productId = req.params.id;
         productHelpers.updateProduct(productId,req.body).then(() => {
         res.redirect('/admin');
         if (req.files.Image) {
          let image = req.files.Image;
          const uploadPath ='./public/product-images/'+productId+'.jpeg';
          image.mv(uploadPath)
  }
         })
        })



module.exports = router;
