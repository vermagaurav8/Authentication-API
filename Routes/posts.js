const router = require('express').Router();
const user = require('../modal/user');
const verify = require('./verifytoken');

router.get('/',verify,(req,res) => {
    res.send(req.user);
    user.findByIdAndRemove({_id: req.user});
});

module.exports = router;