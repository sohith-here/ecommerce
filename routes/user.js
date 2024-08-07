const express = require('express');
const router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', (req, res, next) => {
  let user = req.session.user;
  productHelpers.getAllProducts().then((products) => {
    res.render('user/view-products', { products, user });
  });
});

router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/');
  } else {
    // Pass loginErr to the template and log the session
    console.log("Session before rendering login:", req.session);
    res.render('user/login', { "loginErr": req.session.loginErr });
    // Clear the error after rendering
    req.session.loginErr = false;
  }
});

router.get('/signup', (req, res) => {
  res.render('user/signup');
});

router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    res.send("success");
  });
});

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect('/');
    } else {
      // Set the loginErr session variable and log the session
      req.session.loginErr = "Invalid username or password";
      console.log("Session after failed login attempt:", req.session);
      res.redirect('/login');
    }
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error during logout");
    }
    res.redirect('/');
  });
});

router.get('/cart',verifyLogin,(req,res)=>{
  res.render('user/cart')
})



module.exports = router;
