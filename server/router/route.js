import express from "express";
const router = express.Router();
import { createReset, generateOTP, getUser, login, register, resetPassword, updateUser, verifyOTP, verifyUser } from "../controller/controller.js";

import Auth, {localVariables} from "../middleware/auth.js";

//post method
router.post('/register', register); //register user
//router.post('/register-mail', ); //send the email
router.post('/auth', (req, res) => res.end()); //authenticate user
router.post('/login', verifyUser, login); //login app

//get methods
router.get('/user/:username', getUser); //get user with username
router.get('/generate-otp',verifyUser, localVariables, generateOTP);  //generate random OTP
router.get('/verify-otp', verifyUser,  verifyOTP);  // verify generated OTP
router.get('/create-reset', createReset); //reset all the variables

//put methods
router.put('/update-user',Auth, updateUser); //to update user profile
router.put('/reset-password', resetPassword); //use to reset password

export default router;