const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const config = require('../configs/jwt-config')
const ensureAuthenticated = require('../modules/ensureAuthenticated')
const User = require('../models/User');
var Cart = require('../models/Cart');
let CartClass = require('../modules/Cart')
const Product = require('../models/Product')
const Variant = require('../models/Variant')


//POST /signin
router.post('/signin', function (req, res, next) {
  const { fullname, email, password, verifyPassword } = req.body
  req.checkBody('fullname', 'fullname is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password', 'Passwords have to match').equals(req.body.verifyPassword);

  var errors = req.validationErrors();
  if (errors) {
    res.status(400).json({
      errors: errors,
      title: 'Signin',
    });
  } else {
    var newUser = new User({
      fullname: fullname,
      password: password,
      email: email
    });
    User.createUser(newUser, function (err, user) {
      if (err) throw err;
    });
    res.json({ message: 'You are registered and you can login' })
  }
});

//POST /login
router.post('/login', function (req, res, next) {
  const { email, password } = req.body.credential
  if (!email || !password) {
    res.status(400).json({ message: "missing username or password" })
  }
  User.getUserByEmail(email, function (err, user) {
    if (err) throw err
    if (!user) {
      res.status(403).json({ message: "Incorrect email or password" })
    }
    User.comparePassword(password, user.password, function (err, isMatch) {
      if (err) throw err
      if (isMatch) {
        let token = jwt.sign(
          { email: email },
          config.secret,
          { expiresIn: '1d' }
        )
        res.status(201).json({
          user_token: {
            user_id: user.id,
            token: token,
            expire_in: '1d'
          }
        })
      } else {
        res.status(403).json({ message: "Incorrect email or password" })
      }
    })
  })
})

//GET cart
router.get('/:userId/cart', ensureAuthenticated, function (req, res, next) {
  let userId = req.params.userId
  Cart.getCartByUserId(userId, function (err, cart) {
    if (err) throw err
    if (cart.length < 1) {
      res.status(404).json({ message: "create a cart first" })
    }
    res.json({ cart: cart[0] })
  })
})

//POST cart
router.post('/:userId/cart', ensureAuthenticated, function (req, res, next) {
  let userId = req.params.userId
  let requestProduct = req.body
  let { productId } = requestProduct.product
  let { color, size } = requestProduct.product

  Cart.getCartByUserId(userId, function (err, c) {
    if (err) throw err
    let oldCart = new CartClass(c[0] || { userId })

    Product.findById(productId, function (e, product) {
      if (e) {
        e.status = 406; next(e);
      }
      else {
        // no variant applied
        if (product) {
          oldCart.add(product, product.id);
          let newCart = oldCart.generateModel()
          Cart.updateCartByUserId(
            userId,
            newCart,
            function (err, result) {
              if (err) throw err
              res.json(result)
            })
        }
        // apply variant
        else {
          Variant.getVariantByID(productId, function (e, variant) {
            if (e) {
              e.status = 406; next(e);
            }
            else {
              Product.getProductByID(variant.productID, function (e, p) {
                let color = (variant.color) ? "- " + variant.color : "";
                let size = (variant.size) ? "- " + variant.size : "";
                variant.title = p.title + " " + color + size
                variant.price = p.price
                oldCart.add(variant, variant.id);
                let newCart = oldCart.generateModel()
                Cart.updateCartByUserId(
                  userId,
                  newCart,
                  function (err, result) {
                    if (err) throw err
                    res.json(result)
                  })
              })
            }
          })
        }
      }
    })
  })
})

//PUT cart
router.put('/:userId/cart', function (req, res, next) {
  let userId = req.params.userId
  let requestProduct = req.body
  let { productId, color, size } = requestProduct.product

  Cart.getCartByUserId(userId, function (err, c) {
    if (err) throw err
    let oldCart = new CartClass(c[0] || {})
    Product.getProductByID(productId, function (err, p) {
      if (err) throw err
      // console.log(`oldCart: \n${JSON.stringify(oldCart)}\n`);
      let newCart = oldCart.add(p, productId, { color, size })
      // console.log(`newCart: \n${JSON.stringify(newCart)}\n`);

      //exist cart in databse
      if (c.length > 0) {
        Cart.updateCartByUserId(
          userId,
          {
            items: newCart.items,
            totalQty: newCart.totalQty,
            totalPrice: newCart.totalPrice,
            userId: userId
          },
          function (err, result) {
            if (err) throw err
            res.json(result)
          })
      } else {
        //no cart in database
        newCart = new Cart({
          items: newCart.items,
          totalQty: newCart.totalQty,
          totalPrice: newCart.totalPrice,
          userId: userId
        })
        Cart.createCart(newCart, function (err, resultCart) {
          if (err) throw err
          res.status(201).json(resultCart)
        })
      }
    })
  })
})

module.exports = router;