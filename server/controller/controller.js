import UserModel from "../models/user.model.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ENV from '../config.js';

/** POST: http://localhost:8080/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "profile": ""
}
*/
export async function register(req, res) {
  try {
    const { username, password, profile, email } = req.body;

    //check if there's an existing username
    const existUser = await UserModel.findOne({ username });
    if (existUser) {
      return res.status(400).json({ error: "Username already exists" });
    };

    //check if there's an existing email
    const existEmail = await UserModel.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ error: "Email already exists" });
    };

    //hash password here;
    //const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserModel({
        username,
        password: hashedPassword,
        email,
        profile: profile || '',
    });

    if(user){
        await user.save();

        res.status(201).send({msg: "User Register Successfully", user});
    } else {
        res.status(400).json({ error});
    }

  } catch (error) {
    console.log("Error in register controller");
    return res.status(500).send(error);
  }
};

/** POST: http://localhost:8080/api/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
export async function login(req, res) {
  try {
    const {username, password} = req.body;
    const user = await UserModel.findOne({username});

    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

    if(!user || !isPasswordCorrect){
        return  res.status(404).json({ error: "Invalid Username or Password" });
    };

    //jwt*****************************
    const token = jwt.sign({
        userId: user._id,
        username: user.username
    }, 
    ENV.JWT_SECRET ,
    {expiresIn: "15d"});

    res.status(200).json({
        msg: 'Login Successful',
        username: user.username,
        token
    });

  } catch (error) {
    console.log("Error in login controller");
    return res.status(500).send(error);
  };
};

/** GET: http://localhost:8080/api/user/example123 */
export async function getUser(req, res) {
  res.json("getUser route");
}

/** PUT: http://localhost:8080/api/update-user 
 * @param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
export async function updateUser(req, res) {
  res.json("updateUser route");
}

/** GET: http://localhost:8080/api/generate-otp */
export async function generateOTP(req, res) {
  res.json("generateOTP route");
}

/** GET: http://localhost:8080/api/verify-otp */
export async function verifyOTP(req, res) {
  res.json("verifyOTP route");
}

// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/create-reset */
export async function createReset(req, res) {
  res.json("update User route");
}

// update the password when we have valid session
/** PUT: http://localhost:8080/api/reset-password */
export async function resetPassword(req, res) {
  res.json("resetPassword route");
}
