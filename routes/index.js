var express = require('express');
const ensureAuthenticated = require('../modules/ensureAuthenticated')
let Product = require('../models/Product')
let Variant = require('../models/Variant')
var router = express.Router();

//GET /products
router.get('/products', ensureAuthenticated, function (req, res, next) {
  let { department, category } = req.query
  if (!department && !category) {
    Product.getAllProducts(function (e, products) {
      if (e) {
        console.log("Failed on router.get('/')\nError:".error, e.message.error + "\n")
        e.status = 406; next(e);
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
      if (err) throw err
      return res.json({ variants })
    })
  }
  Variant.getAllVariants(function (e, variants) {
    if (e) {
      console.log("Failed on router.get('/')\nError:".error, e.message.error + "\n")
      e.status = 406; next(e);
    }
    else {
      res.json({ variants })
    }
  })
})

//GET /variants/:id
router.get('/variants/:id', ensureAuthenticated, function (req, res, next) {
  let id = req.params.id
  if (id) {
    Variant.getVariantByID(id, function (err, variants) {
      if (err) throw err
      res.json({ variants })
    })
  }
})

//GET /search?
router.get('/search', function (req, res, next) {
  let query = req.query.query
  Product.getProductByDepartment(query, function (err, p) {
    if (err) throw err
    if (p.length > 0) {
      res.json({ products: p })
    } else {
      Product.getProductByCategory(query, function (err, p) {
        if (err) throw err
        if (p.length > 0) {
          res.json({ products: p })
        } else {
          Product.getProductByID(query, function (err, p) {
            if (err) throw err
            if (p.length > 0) {
              res.json({ products: p })
            } else {
              res.status(404).json({ message: "no product exist" })
            }
          })
        }
      })
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
