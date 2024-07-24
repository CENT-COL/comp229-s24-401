const otplib = require('otplib');
const qrcode = require('qrcode');
const User = require('../models/user');
const generateToken = require('../utils/jwt');
const jwt = require('jsonwebtoken');

// Register a User
exports.register = async(req, res) => {

    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email, password });
        await user.save();

        const token = generateToken(user);
        res.status(201).json({ message: 'User created successfully', token });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
// Login a User
exports.login = async (req, res) => {
    const { email, password} = req.body;
    console.log("Email and Password", email, password );

    try {
        const { email, password} = req.body;
        const user = await User.findOne({ email });
        
        if(!user) 
            return res.status(400).json({ message: 'User not found' });

        console.log("User", user);

        const isMatch = await user.comparePassword(password);

        console.log("Matching password", isMatch)

        if(!isMatch){
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user);
        res.json({ message: 'User logged in successfully', token, username: user.username });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.setup2FA = async (req, res) => {
    const { email } = req.body;

    // Generate a secret key
    const secret = otplib.authenticator.generateSecret();

    // create an otp auth url for the QR code
    const otpauth = otplib.authenticator.keyuri(
        email, 
        'COMP229-S24-401',
        secret
    );

    // Generate a QR code
    qrcode.toDataURL(otpauth, async (err, imageUrl) => {
        if (err){
            return res.status(500).json({ message: "Error generating the QR code", err });
        }

        try {
            // Store the secret in the user's profile (on DB)
            // const user = await User.findOneAndUpdate(
            //     {email},
            //     {otpSecret: secret}
            // );

            const user = await User.findOneAndUpdate(
                {email}, 
                {$set: {otpSecret: secret}},
                {new:true}
            )

            if(!user){
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({message: 'QR Code Generated', imageUrl})
        } catch (error) {
            res.status(500).json({message: "Error storing secret", error });
        }
    });

}

// 2FA endpoint to enable/verify 2FA Setup
exports.verify2FA = async (req, res) => {
    const {email, token} = req.body;

    //Fetch user secret from DB
    const user = await User.findOne({email});

    if(!user){
        return res.status(404).json({message: 'User not found'});
    }

    const secret = user.otpSecret;

    if (!secret){
        return res.status(400).json({message: '2FA not setup'});
    }

    // Verify the token
    const isValid = otplib.authenticator.check(token, secret)

    if(isValid){
        // mark the user as having 2FA enabled
        user.is2FAEnabled = true;
        await user.save();
        res.status(200).send('2FA setup is valid');
    } else {
        res.status(400).send('Invalid OTP')
    }
}

exports.verifyOTP = async (req, res) => {
    const {email, token} = req.body;

    try {
        //Fetch the user's secret from the DB
    const user = await User.findOne({email});

    if (!user){
        return res.status(404).json({message: 'User not found'});
    }

    const secret = user.otpSecret;

    if (!secret){
        return res.status(400).json({message: '2FA not setup'});
    }

    const isValid = otplib.authenticator.check(token, secret);

    if(isValid){
        const jwtToken = jwt.sign({id: user._id}, process.env.JWT_SECRET,
             {expiresIn: '30d'});
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: jwtToken
        });
       
    } else {
        res.status(401).json({message: 'Invalid email or OTP'});
    }
    } catch (error) {
        res.status(500).json({message:'Server error',  error});
    }
}

