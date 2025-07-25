import jwt from "jsonwebtoken";
import User from "../models/User.js";
const generateToken  = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn:"7d"});  
}

export const registerUser = async(req, res) =>{
    const {fullname, email, password, profileImageUrl} = req.body;

    console.log(fullname,email,password);

    if(!fullname || !email || !password)
    {
        return res.status(400).json({message: "all fields are requireddd"})
    }

    try{
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "User already exists"})
        }

        const user = await User.create({
            fullname,
            email,
            password,
            profileImageUrl
        });

        res.status(201).json({
            id:user._id,
            user,
            token:generateToken(user._id),
        });
    }catch(err){
        res.status(500).json({message: "error in registering user", error: err.message});
    }
};

export const loginUser = async(req, res) =>{
    const {email, password } = req.body;
    if(!email || !password)
    {
        return res.status(400).json({message: "all fields are required"})
    }

    try{
        const user = await User.findOne({email});
        if(!user || !(await user.comparePassword(password))){
            return res.status(400).json({message: "invalid Credentils"})
        }

        res.status(201).json({
            id:user._id,
            user,
            token:generateToken(user._id),
        });
    }catch(err){
        res.status(500).json({message: "error in Login process", error: err.message});
    }
};

export const getUserInfo = async(req, res) =>{
    try{
        const user = await User.findById(req.user.id).select("-password");

        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        res.status(200).json(user);
    }catch(err){
        res.status(500).json({message: "error in finding User info.", error: err.message});
    }
};