const jwb = require('jsonwebtoken')
module.exports = async (payload)=>{

    const token = await jwb.sign(
        payload,
        process.env.secretKey,
        {expiresIn : "1d"}
    )
    return token;
 
}