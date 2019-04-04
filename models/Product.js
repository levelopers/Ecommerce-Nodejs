// Object modelling for product. This model will represent in the database and
// we will read the all the information according to this model.
// You can think that this is a representation of the database and we are using that
// for saving, reading, updating information from the database.

var mongoose = require('mongoose');

var productSchema  = mongoose.Schema({
    imagePath: {
        type: String
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    department: {
        type: String
    },
    category: {
        type: String
    },
    price: {
        type: Number
    },
    color: {
        type: String
    },
    size: {
        type: String
    },
    quantity: {
        type: Number
    }
});

var Product = module.exports = mongoose.model('Product', productSchema);

// These are functions to get data from the database. You can even reach the information
// without calling this functions but I just want to show you how you can add some functions
// to your model file to get specific data.

module.exports.getAllProducts = function(callback){
    Product.find(callback)
}

module.exports.getProductByID = function(id, callback){
    Product.findById(id, callback);
}

module.exports.getProductByDepartment = function(department, callback){
    var query = {department: department};
    Product.find(query, callback);
}

module.exports.getProductByCategory = function(department, category, callback){
    var query = {department: department, category: category};
    Product.find(query, callback);
}