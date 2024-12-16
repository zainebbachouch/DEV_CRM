const jwt = require('jsonwebtoken');

const createToken  = async (role, iduser, email, secretkey) => {
    const token = jwt.sign({ role: role, id: iduser, email: email }, secretkey);
    return token;

}

module.exports = { createToken  }