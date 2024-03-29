const express = require('express');
const { signUp, signIn, authenticate, checkAdmin, signinWithGoogle } = require('../controllers/auth.controller');
const { updateUser, updateAdmin, getAllUser, sendUser, forgetPassword, resetPassword, userSearch, getUser, getAllAdmin, updateProfilePicture } = require('../controllers/user.controller');


const router = express.Router();


router.route('/')
    .post(authenticate,sendUser)
    .get(userSearch)
    // .patch();

router.route('/:id')
    .get(getUser)
    // .patch(authenticate,updateUser)
    .patch(updateUser)
    .delete(/* Deactivate Certain user*/);

// router.patch('/update-admin/:id',authenticate,checkAdmin,updateAdmin);
router.patch('/update-admin/:id',updateAdmin);

router.post('/signup',signUp);
router.post('/login',signIn);
router.post('/admins',getAllAdmin);
router.post('/forgetPassword',forgetPassword);
router.patch('/resetPassword/:token',resetPassword);
router.post('/signinWithGoogle',signinWithGoogle);
router.post('/updateProfilePicture',authenticate,updateProfilePicture);

module.exports = router;
