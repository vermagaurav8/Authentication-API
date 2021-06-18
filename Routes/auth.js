const router = require('express').Router();
const User = require('../modal/user');
const {registerValidation, loginValidation} = require('../Routes/validation')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register',  async (req,res) => {
    // validate the DATA
    const {error} = registerValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    //check user is in database
    const emailExists = await User.findOne({email :req.body.email});
    if(emailExists) return res.status(400).send('Email already exists')

    //Hash Passwords
    const salt =  await bcrypt.genSalt(10);
    const hashPasswords = await bcrypt.hash(req.body.password,salt);

    // Create a new User
    const user = new User({
       name : req.body.name,
       email : req.body.email,
       password : hashPasswords
    });
    try{
        const savedUser = await user.save();
        res.send({user : user._id });
    }catch(err) {
        res.status(400).send(err);
    }
});


//LOGIN

router.post('/login', async (req,res) => {

    // Validate data before a user 
    const {error} = loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    //check user in database
    const user = await User.findOne({email :req.body.email});
    if(!user) return res.status(400).send('Email Not Found')

    //password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.status(400).send('Invalid Password');

    //create a token and assign it
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);

    res.send('logged In');
});

module.exports = router;