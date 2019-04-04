var express = require('express');
let Product = require('../models/Product')
let Cart = require('../models/Cart')
var Department = require('../models/Department');
var router = express.Router();

router.get('/',ensureAuthenticated, function(req, res, next)
{
  Product.getAllProducts(function(e, products)
  {
    if (e)
    {
      console.log("Failed on router.get('/')\nError:".error, e.message.error + "\n")
      e.status = 406; next(e);
    }
    else
    {
      res.send(products)
    }
  });
});


router.get('/products-list/:department', function (req, res, next) {
  let productDepartment = req.params.department
  Product.getProductByDepartment(productDepartment, function (e, products) {
    if (e) {
      console.log("Failed on router.get('/')\nError:".error, e.message.error + "\n")
      e.status = 406; next(e);
    }
    else {
      if (checkType(products) === 'Array' && products.length < 1) {
        res.status(404)
      } else {
        res.send(products)
      }
    }
  })
});


//ensureAuthenticated
router.get('/product-list/:department/:category', function(req, res, next)
{
  let productDepartment = req.params.department;
  let productCategory = req.params.category;
  Product.getProductByCategory(productDepartment, productCategory, function(e, products)
  {
    if (e)
    {
      console.log("Failed on router.get('/')\nError:".error, e.message.error + "\n")
      e.status = 406; next(e);
    }
    else
    {
      res.send(products)
    }
  });
});

router.get('/add-to-bag/:id', function(req, res, next){
    let productId = req.params.id;
    let cart = new Cart(req.session.cart ? req.session.cart : {});
    
    Product.findById(productId, function(e, product){
      if (e)
      {
        console.log("Failed on router.get('/add-to-bag/:id')\nError:".error, e.message.error + "\n")
        e.status = 406; next(e);
      }
      else
      {
        if (product)
        {
          cart.add(product, product.id);
          cart.userId = req.user._id;
          req.session.cart = cart;
          res.redirect('/');
        }
        else
        {
          Variant.findById(productId, function(e, variant){
            if (e)
            {
              console.log("Failed on router.get('/add-to-bag/:id')\nError:".error, e.message.error + "\n")
              e.status = 406; next(e);
            }
            else
            {
              Product.findById(variant.productID, function(e, p){
                let color = (variant.color) ? "- " + variant.color : "";
                variant.title = p.title + " " + color
                variant.price = p.price
                cart.add(variant, variant.id);
                req.session.cart = cart;
                res.redirect('/');
              })
            }
          })
        }
      }
    })
});

function ensureAuthenticated(req, res, next){
  // console.log(req.session);
  
  if (req.isAuthenticated())
  {
    Department.getAllDepartments(function(e, departments)
    {
      req.session.department = JSON.stringify(departments)
      return next();
    })
  }
  else{
    //req.flash('error_msg', 'You are not logged in');
    res.redirect('/users/login');
  }
};

// function checkType(data) {
//   let typeString = Object.prototype.toString.call(data).slice(8)
//   switch (true) {
//     case typeString.indexOf('Function') !== -1:
//       return 'Function'
//     case typeString.indexOf('Number') !== -1:
//       return 'Number'
//     case typeString.indexOf('Null') !== -1:
//       return 'Null'
//     case typeString.indexOf('Undefined') !== -1:
//       return 'Undefined'
//     case typeString.indexOf('String') !== -1:
//       return 'String'
//     case typeString.indexOf('Array') !== -1:
//       return 'Array'
//     case typeString.indexOf('Boolean') !== -1:
//       return 'Boolean'
//     case typeString.indexOf('Object') !== -1:
//       return 'Object'
//     default:
//       return null
//   }
// }


module.exports = router;
