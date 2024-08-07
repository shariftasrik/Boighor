import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";


//login user

const loginUser = async (req, res) => {
  const {email,password} = req.body;
  try {
    const user = await userModel.findOne({email});
    if(!user){
      return res.json({success:false,message:"User is not  exist there"})
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if (!isMatch) {
    return res.json({sucess:false,message:"Invalid"})  
    }
  const token = createToken(user._id);
  res.json({success:true,token})

  } catch (error) {
  console.log(error);
  res.json({success:false,message:"Error"})
  }
}


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' }); // Added token expiry for security
  };


  
// register user
const registerUser = async (req, res) => {
    const { name, password, email } = req.body;
    try {
      // Checking if user already exists
      const exists = await userModel.findOne({ email });
      if (exists) {
        return res.status(400).json({ success: false, message: "User already exists" });
      }
  
      // Validating email format & strong password
      if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: "Enter a valid email" });
      }
      if (password.length < 8) {
        return res.status(400).json({ success: false, message: "Enter a valid password" });
      }
  
      // Hashing user password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const newUser = new userModel({
        name: name,
        email: email,
        password: hashedPassword
      });
      const user = await newUser.save();
      const token = createToken(user._id);
      res.status(201).json({ success: true, token });
  
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  };
  
  export { loginUser, registerUser };