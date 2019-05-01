var express = require('express');
var router = express.Router();
const ensureAuthenticated = require('../modules/ensureAuthenticated')
const Product = require('../models/Product')
const Variant = require('../models/Variant')
const Department = require('../models/Department')
const Category = require('../models/Category')
const TypedError = require('../modules/ErrorHandler')
const Cart = require('../models/Cart');
const CartClass = require('../modules/Cart')
const paypal_config = require('../configs/paypal-config')
const paypal = require('paypal-rest-sdk')


//GET /products
router.get('/products', ensureAuthenticated, function (req, res, next) {
  let { department, category } = req.query
  if (!department && !category) {
    Product.getAllProducts(function (e, products) {
      if (e) {
        if (err) return next(err)
      }
      else {
        res.json({ products: products })
      }
    })
  } else {
    queryProducts(department, category, res)
  }
});

//GET /products/:id
router.get('/products/:id', ensureAuthenticated, function (req, res, next) {
  let productId = req.params.id;
  Product.getProductByID(productId, function (e, item) {
    if (e) {
      e.status = 404; next(e);
    }
    else {
      res.json({ product: item })
    }
  });
});

//GET /variants
router.get('/variants', ensureAuthenticated, function (req, res, next) {
  let { productId } = req.query
  if (productId) {
    Variant.getVariantProductByID(productId, function (err, variants) {
      if (err) return next(err)
      return res.json({ variants })
    })
  } else {
    Variant.getAllVariants(function (e, variants) {
      if (e) {
        if (err) return next(err)
      }
      else {
        return res.json({ variants })
      }
    })
  }
})

//GET /variants/:id
router.get('/variants/:id', ensureAuthenticated, function (req, res, next) {
  let id = req.params.id
  if (id) {
    Variant.getVariantByID(id, function (err, variants) {
      if (err) return next(err)
      res.json({ variants })
    })
  }
})

//GET /departments
router.get('/departments', ensureAuthenticated, function (req, res, next) {
  Department.getAllDepartments(function (err, d) {
    if (err) return next(err)
    res.status(200).json({ departments: d })
  })
})

//GET /categories
router.get('/categories', ensureAuthenticated, function (req, res, next) {
  Category.getAllCategories(function (err, c) {
    if (err) return next(err)
    res.json({ categories: c })
  })
})

//GET /search?
router.get('/search', function (req, res, next) {
  let query = req.query.query
  Product.getProductByDepartment(query, function (err, p) {
    if (err) return next(err)
    if (p.length > 0) {
      res.json({ products: p })
    } else {
      Product.getProductByCategory(query, function (err, p) {
        if (err) return next(err)
        if (p.length > 0) {
          res.json({ products: p })
        } else {
          Product.getProductByID(query, function (err, p) {
            let error = new TypedError('search', 404, 'not_found', { message: "no product exist" })
            if (err) {
              return next(error)
            }
            if (p) {
              res.json({ products: p })
            } else {
              return next(error)
            }
          })
        }
      })
    }
  })
})

//GET /checkout
router.get('/checkout/:cartId', function (req, res, next) {
  const cartId = req.params.cartId
  const fullURL = req.protocol + '://' + req.get('host') + req.originalUrl
  Cart.getCartById(cartId, function (err, c) {
    if (err) return next(err)
    if (!c) {
      let err = new TypedError('/checkout', 400, 'invalid_field', { message: 'cart not found' })
      return next(err)
    }
    const items_arr = new CartClass(c).generateArray()
    const paypal_list = []
    for (const i of items_arr) {
      paypal_list.push({
        "name": i.item.title,
        "price": i.item.price,
        "currency": "CAD",
        "quantity": i.qty
      })
    }
    const create_payment_json = {
      "intent": "sale",
      "payer": {
        "payment_method": "paypal"
      },
      "redirect_urls": {
        "return_url": fullURL + '/success',
        "cancel_url": fullURL + '/cancel'
      },
      "transactions": [{
        "item_list": {
          "items": paypal_list
        },
        "amount": {
          "currency": "CAD",
          "total": c.totalPrice
        },
        "description": "This is the payment description."
      }]
    }
    paypal.configure(paypal_config);
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        console.log("Create Payment Response");
        console.log(payment);
        for (const link of payment.links) {
          if (link.rel === 'approval_url') {
            res.json(link.href)
          }
        }
      }
    });
  })
})

//GET /checkout/cartId/success
router.get('/checkout/:cartId/success', function (req, res, next) {
  var paymentId = req.query.paymentId;
  var payerId = { payer_id: req.query.PayerID };

  paypal.payment.execute(paymentId, payerId, function (error, payment) {
    if (error) {
      console.error(JSON.stringify(error));
      return next(error)
    } else {
      if (payment.state == 'approved') {
        console.log('payment completed successfully');
        console.log(payment);
        res.json(payment)
      } else {
        console.log('payment not successful');
      }
    }
  })
})

  function queryProducts(productDepartment, productCategory, res) {
    if (productDepartment && productCategory) {
      Product.getProductByDepartmentCategory(productDepartment, productCategory, function (e, products) {
        if (e) {
          e.status = 406; next(e);
        }
        else {
          if (products.length < 1) {
            res.status(404).json({ message: "get products fail" })
          } else {
            res.json({ products: products })
          }
        }
      })
    } else if (productDepartment) {
      Product.getProductByDepartment(productDepartment, function (e, products) {
        if (e) {
          e.status = 406; next(e);
        }
        else {
          if (products.length < 1) {
            res.status(404).json({ message: "get products fail" })
          } else {
            res.json({ products: products })
          }
        }
      })
    } else if (productCategory) {
      Product.getProductByCategory(productCategory, function (e, products) {
        if (e) {
          e.status = 406; next(e);
        }
        else {
          if (products.length < 1) {
            res.status(404).json({ message: "get products fail" })
          } else {
            res.json({ products: products })
          }
        }
      })
    }
  }


  module.exports = router;
