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
    res.status(400).send({
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
// req.body.cart
// {
//   "userId" : "5caf90b95d51a668344ba1e1",
//     "product": {
//     "productId": "5bedf5eec14d7822b39d9d4e",
//       "color": "orange",
//         "size": "M"
//   }
// }

router.post('/:userId/cart', ensureAuthenticated, function (req, res, next) {
  let userId = req.params.userId
  let requestProduct = req.body.cart
  let {productId} = requestProduct.product

  console.log(requestProduct,productId);

  Cart.getCartByUserId(userId, function (err, c) {
    if (err) throw err
    console.log(`c: \n${c}`);
    
    let oldCart = new CartClass(c)
    Variant.getProductByID(productId, function (err, product) {
      if (err) throw err
      console.log(`product: \n${product}`);
      
      let newCart = oldCart.add(product, productId)
      console.log(JSON.stringify(c));
      
      //exist cart in databse
      if (c) {
        Cart.updateCartByuserId(
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
        Cart.createCart(newCart, function (err, c) {
          if (err) throw err
          res.status(201).json(c)
        })
      }
    })
  })


})

//PUT cart
router.put('/:userId/cart', function (req, res, next) {
  let userId = req.params.userId
  let cart = req.body.cart
  let productId = Object.keys(cart.items)[0]

  Cart.getCartByUserId(userId, function (err, c) {
    if (err) throw err
    let oldCart
    if (c.length > 0) {
      oldCart = new CartClass(c[0])
    } else {
      oldCart = new CartClass({})
    }
    Product.getProductByID(productId, function (err, product) {
      if (err) throw err
      let newCart = oldCart.add(product, productId)
      Cart.updateCartByuserId(
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
    })
  })


})
// db.carts
// {
// 	"_id" : ObjectId("5cafefa23e358c6d7669333b"),
// 	"items" : {
// 		"5bedf5eec14d7822b39d9d4e" : {
// 			"item" : {
// 				"_id" : "5bedf5eec14d7822b39d9d4e",
// 				"imagePath" : "/uploads/1775300615_1_1_1.jpg",
// 				"title" : "Perl Knit Swear",
// 				"description" : "Purl-stitch knit sweater in a combination of textures. Ribbed trim.",
// 				"price" : 79.99,
// 				"color" : "Orange",
// 				"size" : "M,L",
// 				"quantity" : 8,
// 				"department" : "Men",
// 				"category" : "Knitwear",
// 				"__v" : 0
// 			},
// 			"qty" : 0,
// 			"price" : 79.99
// 		}
// 	},
// 	"totalQty" : 9,
// 	"totalPrice" : "401.92,",
// 	"userId" : "5caf90b95d51a668344ba1e1",
// 	"__v" : 0
// }
function calcuCart(requestCartObj, callback) {
  const { userId } = requestCartObj
  Cart.getCartByUserId(userId, function (err, cart) {
    if (err) throw err
    console.log(`calcuCart: \n${cart}`);

    if (cart.length > 0) {
      let { totalQty, totalPrice } = cart
      for (let productId in requestCartObj.items) {
        let { color, size, qty } = requestCartObj.items[productId]

        //old cart dont have new cart product info
        if (!cart.items[productId]) {
          Product.getProductByID(productId, function (err, product) {
            if (err) throw err
            let { price } = product
            let newPrice = qty * price
            cart.items[productId]
            totalQty += qty
            totalPrice += newPrice
          })
        } else {
          let price = cart.items[productId].item.price
          let newPrice = qty * price
          cart.items[productId].item.color = color
          cart.items[productId].item.size = size
          cart.items[productId].qty = qty
          cart.items[productId].price = newPrice
          totalQty += qty
          totalPrice += newPrice
        }
      }
      cart.totalQty = totalQty
      cart.totalPrice = totalPrice
    }
  })
}

module.exports = router;