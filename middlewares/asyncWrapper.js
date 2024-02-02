module.exports = (asyncfn=>{
    return (req, res,next) => {
        asyncfn(req, res, next).catch(err => {
            return next(err);
        })
    }
})