const jwt = require('jsonwebtoken')
const config = require('../configs/jwt-config')

function ensureAuthenticated(req, res, next) {
  let token = req.headers['x-access-token'] || req.headers['authorization']
  //OAuth 2.0 framework 'bearer' token type
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length)
  }
  if (token) {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        console.log(err);
        return res.json({
          message: "Token is not valid"
        })
      } else {
        //bind on request
        // req.decoded = decoded
        console.log(`decoded: \n${JSON.stringify(decoded)}`);
        
        next()
      }
    })
  } else {
    return res.json({
      message: "Auth token is not supplied"
    })
  }
};

module.exports = ensureAuthenticated