const {Router} = require('express')
const config = require('config')
const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator')
const User = require('../models/User')
const router = Router()


router.post('/register', 
[
    check('email', 'uncurrect email').isEmail(),
    check('password', 'Min length password 6 symbols').isLength({min: 6})
], 
async (req, res) => {
    try {
        const errors = validationResult(req)

        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array(),
                message: 'Uncorrect data from registration'
            })
        }

        const {email, password} = req.body

        const candidate = await User.findOne({email})

        if(candidate){
           return res.status.json({message: 'such user already exists'})
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const user = new User({email, password: hashedPassword})
        await user.save()

        res.status(201).json({message: 'User created'})

    } catch(err){
        res.status(500).json({message: 'such user already exists'})
    }
})

router.post('/login', 
[
    check('email', 'Input correct email').normalizeEmail().isEmail(),
    check('password', 'Input password').exists()
],
async (req, res) => {
    try {
        const errors = validationResult(req)

        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array(),
                message: 'Uncorrect data from log in'
            })
        }

        const {email, password} = req.body

        const user = await User.findOne({email})

        if(!user){
            return res.status(400).json({message: 'User is not found'})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.status(400).json({message: 'Uncurrect password'})
        }

        const token =  jwt.sign(
            {userId: user.id},
            config.get('jwtSecret'),
            {expiresIn: '1h' }
        )

        res.status(200).json({token, userId: user.id})
       

    } catch(err){
        res.status(500).json({message: 'Server erorr'})
    }
})

module.exports = router