const express=require('express');
const router=express.Router();

const Usercontroller=require('../controllers/user_controller');
console.log('in router');
router.get('/',Usercontroller.home);
router.get('/show',Usercontroller.show);
router.post('/login',Usercontroller.login);
router.post('/register',Usercontroller.register);
router.get('/verifyAccessToken',Usercontroller.verifyAccessToken);
router.get('/renewAccessToken',Usercontroller.renewAccessToken);


module.exports=router;