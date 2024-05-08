import UserModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ENV from "../config.js";
import otpGenerator from "otp-generator";
import userModel from "../models/user.model.js";

//middleware for verify user
export async function verifyUser(req, res, next) {
  try {
    const { username } = req.method == "GET" ? req.query : req.body;

    //check if user exist
    let exist = await UserModel.findOne({ username });
    if (!exist) return res.status(404).send({ error: "Can't find User" });
    next();
  } catch (error) {
    console.error("Error in verifyUser controller");
    return res.status(500).send({ error: "Authentication Error" });
  }
}

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
    }

    //check if there's an existing email
    const existEmail = await UserModel.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    //hash password here;
    //const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserModel({
      username,
      password: hashedPassword,
      email,
      profile: profile || "",
    });

    if (user) {
      await user.save();

      res.status(201).send({ message: "User Register Successfully", user });
    } else {
      res.status(400).json({ error });
    }
  } catch (error) {
    console.error("Error in register controller");
    return res.status(500).send(error);
  }
}

/** POST: http://localhost:8080/api/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
export async function login(req, res) {
  try {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res.status(404).json({ error: "Invalid Username or Password" });
    }

    //jwt*****************************
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      ENV.JWT_SECRET,
      { expiresIn: "15d" }
    );

    res.status(200).json({
      msg: "Login Successful",
      username: user.username,
      token,
    });
  } catch (error) {
    console.error("Error in login controller");
    return res.status(500).send(error);
  }
}

/** GET: http://localhost:8080/api/user/example123 */
export async function getUser(req, res) {
  const { username } = req.params;

  try {
    if (!username) return res.status(501).send({ error: "Invalid Username" });

    const user = await UserModel.findOne({ username }).exec();

    if (!user)
      return res.status(500).send({ error: "Couldn't Find the User." });

    //remove d password from d data to b sent
    const { password, ...rest } = user._doc;

    return res.status(201).send(rest);
  } catch (error) {
    console.error("Error in getUser controller", error);
    return res.status(404).send({ error: "Cant find User data" });
  }
}

/** PUT: http://localhost:8080/api/update-user 
 * @param: {
  "id" : "<userid>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
export async function updateUser(req, res) {
  try {
    //const id = req.query.id;
    const { userId } = req.user;
    const body = req.body;

    if (userId) {
      const updatedUser = await UserModel.updateOne(
        { _id: userId },
        {
          $set: {
            firstName: body.firstName,
            address: body.address,
            profile: body.profile,
            email: body.email,
          },
        },
        { new: true }
      );

      return res.status(200).json({ message: "Updated..." });
    } else {
      return res.status(401).send({ message: "User Not Found" });
    }
  } catch (error) {
    console.log("Error in updateUser controller", error);
    return res.status(401).send(error);
  }
}

/** GET: http://localhost:8080/api/generate-otp */
export async function generateOTP(req, res) {
  req.app.locals.OTP = await otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  res.status(201).send({ code: req.app.locals.OTP });
}

/** GET: http://localhost:8080/api/verify-otp */
export async function verifyOTP(req, res) {
  const { code } = req.query;
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    (req.app.locals.OTP = null), //reset the OTP value
      (req.app.locals.resetSession = true); //start session for the reset password

    return res.status(201).send({ msg: "Verfiy Successfully" });
  }

  return res.status(400).send({ error: "Invalid OTP" });
}

// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/create-reset */
export async function createReset(req, res) {
  if (req.app.locals.resetSession) {
    req.app.locals.resetSession = false; //aloow access to dis route only once
    return res.status(201).send({ message: "Access grannted" });
  }

  return res.status(440).send({ error: "Session Expired" });
}

// update the password when we have valid session
/** PUT: http://localhost:8080/api/reset-password */
export async function resetPassword(req, res) {
  try {
    const {username, password} = req.body;
    try {
      if(!req.app.locals.resetSession) return res.status(440).send({error: "Session Expired"});

      await UserModel.findOne({username}).exec()
       .then(user => {
         bcrypt.hash(password, 10)
           .then( hashedPassword => {
             UserModel.updateOne({username: user.username}, {password: hashedPassword})
             return res.status(201).send({msg: "Record Updated"})
           })
           .catch(error => {
             return res.status(500).send({ error: "Enable to hash password"})
           });
       })
       .catch((error) => {
         return res.status(404).send({error: 'Username not found'});
       })
    } catch (error) {
      return res.status(500).send({error})
    };

  } catch (error) {
    console.error("Error in resetPasword controller", error);
    return res.status(500).send(error);
  }
}
