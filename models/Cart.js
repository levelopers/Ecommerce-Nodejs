
const mongoose = require('mongoose')

CartSchema = mongoose.Schema({
    items: {
        type: Object
    },
    totalQty: {
        type: Number
    },
    totalPrice: {
        type: Number
    },
    userId: {
        type: String
    }
})

var Cart = module.exports = mongoose.model('Cart',CartSchema)

module.exports.getCartByUserId = function (uid, callback) {
    let query = {userId:uid}
    Cart.find(query,callback)
}

module.exports.getCartById = function(id,callback){
    Cart.findById(id,callback)
}

module.exports.updateCartByuserId = function(userId,newPropObj,callback){
    Cart.findOneAndUpdate(
        {userId:userId},
        {
            $set:newPropObj
        },
        {new:true},
        callback
    )
}

module.exports.updateCartByCartId = function(cartId,newCart,callback){
    Cart.findById(
        {_id:cartId},
        {
            $set:newCart
        },
        callback
    )
}

module.exports.createCart = function(newCart,callback){
    newCart.save(callback)
}