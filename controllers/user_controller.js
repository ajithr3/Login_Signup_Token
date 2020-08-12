const User = require('../models/user_model');
const JWT = require('jsonwebtoken');
let refreshTokens = [];

//Home
const home = (req,res,next) => {
    console.log("Hello from home page");
    res.send("Welcome To our Page");
}

//to get all values from db
const show = (req,res,next) => {
    User.find()
    .then(response=>{
        res.json({
            response
        })
    })
    .catch(error=>{
        res.json({
            message:'Unable to get all details'
        })
    })
}

//Login
const login = async (req,res,next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
        return res.status(403).json({ error: { message: 'There is no email Id like this' } });
    if(user.password===password){
        const val={
            name:user.name,
            email:user.email,
            password:user.password
        }
        console.log(user);
        let accessToken = JWT.sign(val, "access", { expiresIn: "30s" });
        let refreshToken = JWT.sign(val, "refresh", { expiresIn: "18000s" });
        refreshTokens.push(refreshToken);

        return res.status(201).json({
            token1:"Access Token",
            accessToken,
            token2:"Refresh token",
            refreshToken
        });
    }
    else{
        res.json({
             message:'Wrong  password'
        })
    }
}


//register
const register= async (req,res,next) => {
    const {name,email,password}=req.body;
    const val=req.body;
    console.log(name+email+password);
    let user=new User({
        name:name,
        email:email,
        password:password
    });
    const dup = await User.findOne({email});
    if (dup)
        return res.status(403).json({ error: { message: 'This Email is already in use!' } });
    await user.save()
    .then(response=>{
        let accessToken = JWT.sign(val, "access", { expiresIn: "30s" });
        let refreshToken = JWT.sign(val, "refresh", { expiresIn: "18000s" });
        refreshTokens.push(refreshToken);
        return res.status(201).json({
            token1:"Access token",
            accessToken,
            token2:"Refresh token",
            refreshToken
        });
    })
    .catch(error=>{
        res.json({
            message:'Unable to register'
        })
    })
}


//Verify access token 
const verifyAccessToken=(req,res,next)=>{
    let token = req.headers["authorization"];
    if(!token)
        return res.send("You must send your access token through header");
    token = token.split(" ")[1]; 
    JWT.verify(token, "access", (err, user) => {
        console.log(user);
        if (!err) {
            res.send("Hello  "+user.name);    
        } else {
            const message={
                Problem:"Sorry your access token has been expired",
                Solution:"you can renew your access token by passing your refresh token. Link(.../renewAccessToken)"
            }
            return res.json(message);
        }
    });
}

//renew access token using refreshtoken
const renewAccessToken=(req,res,next)=>{
    let token = req.headers["authorization"];
    if(!token)
        return res.send("You must send your renew token through header");
    token = token.split(" ")[1]; 
    if(!refreshTokens.includes(token))
        return res.send("You have entered wrong refresh token");
    JWT.verify(token, "refresh", (err, user) => {
        const ind=refreshTokens.indexOf(token);
        console.log("check array "+ ind);
        refreshTokens.splice(ind,ind+1);
        if (!err) {
            const val={
                name:user.name,
                email:user.email,
                password:user.password
            }
            console.log(val);
            let accessToken = JWT.sign(val, "access", { expiresIn: "30s" });
            let refreshToken = JWT.sign(val, "refresh", { expiresIn: "18000s" });
            refreshTokens.push(refreshToken);
            return res.status(201).json({
                solution:"Now go and verify your access token",
                token1:"Access token",
                accessToken,
                token2:"Refresh token",
                refreshToken
            });
        } else {
            return res.json({ message: "Your refresh token is also not valid go and do login again" });
        }
    });
}
module.exports={
    home,register,verifyAccessToken,login,show,renewAccessToken
}