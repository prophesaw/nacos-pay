const express = require('express');
const router = express.Router();

const {requireAuth, checkUser}= require('../middleware/userMiddleware');

const {
    home,
    dashBoard,
    loginGet,
    loginPost,
    signupGet,
    signupPost,
    logoutGet,
    payPost,
    payGet,
    payVerify,
    reciept
} = require('../controllers/userController');

router.get('*',checkUser);

router.get('/',home);

router.get('/dashboard',requireAuth,dashBoard);

router.get('/signup',signupGet);
router.post('/signup',signupPost);

router.get('/login',loginGet);
router.post('/login',loginPost);

router.get('/logout',logoutGet)

router.get('/pay',requireAuth,payGet);
router.post('/pay',payPost)

router.get('/error',(req,res)=>{
    res.send('error')
})

router.get('/verify',requireAuth,payVerify);

router.get('/reciept/:id',requireAuth,reciept);


module.exports = router