var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');



/* GET home page. */
router.get('/', function(req, res, next) {
  let user=req.session.user
  productHelpers.getAllProducts().then((products) => {
    res.render('user/view-products', {products,user });
  });
});
router.get('/login',(req,res)=>{
  res.render('user/login')
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response)
    res.send("success")
  })
})
  router.post('/login',(req,res)=>{
    userHelpers.doLogin(req.body).then((response)=>{
      req.session.loggedIn=true
      req.session.user=response.user
      if(response.status){
        res.redirect('/')
      }else{
        redirect('/login')
      }
      })
    })
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})
  


module.exports = router;
