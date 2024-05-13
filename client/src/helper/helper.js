import axios from "axios";
//import jwt_decode from "jwt-decode";
import { jwtDecode } from "jwt-decode";

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN

//get username from token
export const getUsername = async () => {
  const token = localStorage.getItem('token');
  if(!token) return Promise.reject("Cannot find Token");

  let decode = jwtDecode(token);
  console.log(decode);
  return decode;
}

//authenticate functon
export async function authenticate(username) {
  //console.log(username);
  try {
    return await axios.post('/api/auth', { username });
  } catch (error) {
    console.log("Error in auth func", error);
    return { error: "Username doesn't exist!" };
  };
};

//getUser details
export async function getUser({ username }) {
  try {
    const { data } = await axios.get(`/api/user/${username}`);
    return { data };
  } catch (error) {
    console.log("Error in getUser func", error);
    return { error: "Password doesn't match!" };
  };
};

//register user function
export async function registerUser(data) {
  try {

    const {
      data: { message },
      status,
    } = await axios.post('/api/register', data);

    let { username, email } = data;


    //send email
    if (status === 201) {
      await axios.post("/api/register-mail", {
        username,
        userEmail: email,
        text: message,
      });
    }

    return Promise.resolve(message);
  } catch (error) {
    console.log("Error in registerUser func", error);
    return Promise.reject({ error });
  }
};

//login function
export async function verifyPassword({ username, password }) {
  try {
    if (username) {
      const { data } = await axios.post("/api/login", { username, password });
      return Promise.resolve({ data });
    }
  } catch (error) {
    console.log("Error in verifyPassword func", error);
    return Promise.reject({ error: "Password doesn't Match...!" });
  }
};

//update user profile function
export async function updateUser(response) {
  try {
    const token = await localStorage.getItem("token");
    const data = await axios.put("/api/update-user", response, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    console.log(response);

    return Promise.resolve({ data });
  } catch (error) {
    console.log("Error in updateUser func", error);
    return Promise.reject({ error: "Couldn't Update Profile!" });
  };
};

//generate OTP
export async function generateOTP(username) {
  try {
    const {data: {code}, status} = await axios.get('/api/generate-otp', {params: {username}});

    //send mail with the OTP
    if(status === 201){
       let {data: {email}} =  await getUser({username});
       let text = `Your Password Recovery OTP is ${code}. Verify and recover your password.`;
       await axios.post('/api/register-mail', { username, userEmail: email, text, subject : "Password Recovery OTP"})
    };

    return Promise.resolve(code);
  } catch (error) {
    console.log("Error in generateOTP func", error);
    return Promise.reject({ error });
  }
};

//verify OTP
export async function verifyOTP({ username, code }) {
  try {
    const { data, status } = await axios.get("/api/verify-otp", {
      params: { username, code },
    });
    return { data, status };
  } catch (error) {
    console.log("Error in verifyOTP func", error);
    return Promise.reject(error);
  }
};

//reset password
export async function resetPassword({ username, password }) {
  try {
    const { data, status } = await axios.put("/api/reset-password", {
      username,
      password,
    });
    return Promise.resolve({ data, status });
  } catch (error) {
    console.log("Error in resetPassword func", error);
    return Promise.reject({ error });
  }
};
