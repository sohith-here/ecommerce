var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers');
var path = require('path')

/* GET users listing. */


router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{
    //console.log(products)
  res.render('admin/view_products',{admin:true,products})
});
})
router.get('/add-product',function(req,res){
res.render('admin/add-product')
})
router.post('/add-product',function(req,res){
productHelpers.addProduct(req.body,(id)=>{
  let image=req.files.Image
  image.mv('./public/product-images/'+id+'.jpg',(err) => {
    if(!err){
      res.redirect('/admin')
    }else{
      res.send("no imagesssssss")
    }
  })
 
})
})
module.exports = router;
