import userModel from "../Models/user.schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createTransport } from "nodemailer";

dotenv.config();

// ***** User Registration *****

export const registerUser = async (req, res) => {
  try {
    const { username, emailid, password } = req.body;

    const checkuser = await userModel.findOne({
      $or: [{ username: username }, { password: password }],
    });

    console.log(checkuser);

    if (checkuser) {
      console.log("User already exist");

      return res.status(200).json({ message: "user already exist" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    console.log(("hashpassword", hashPassword));

    const newUser = await new userModel({
      username: username,
      emailid: emailid,
      password: hashPassword,
    });

    await res
      .status(200)
      .json({ message: "User registered successfully", message1: newUser });
    await newUser.save();

    console.log("Registration success", newUser);
  } catch (error) {
    console.log(error);

    await res.status(500).json({ message: "User registration failed" });
  }
};

// ***** User Login *****

export const loginUser = async (req, res) => {
  try {
    const { emailid, password } = req.body;

    const user = await userModel.findOne({ emailid: emailid });

    if (!user) {
      console.log(user);

      return res.status(200).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.log("PASSWORD MATCH>>", passwordMatch);
      console.log(password);

      res.status(200).json({ message: "Invalid password" });
    }

    console.log("PASSWORD MATCH>>", passwordMatch);

    const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY);
    res.status(200).json({ message: "Login successfully", token: token });
    console.log("*****Token sendinfo from Backend*****", token);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Invalid user" });
  }
};

// ***** Get User by Id *****

export const getUserById = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await userModel.findOne({ _id: userId });

    if (!user) {
      console.log("user not found");
      return res.status(404).json({ message: "user not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "error in finding user" });
  }
};

// ***** Reset Password *****

export const resetPassword = async (req, res) => {
  try {
    const emailid = req.body.emailid;

    console.log(emailid);

    const user = await userModel.findOne({ emailid: emailid });

    if (!user) {
      return res.status(200).json({ message: "user not found" });
    }

    const resetToken = Math.random().toString(36).slice(-8);
    const resetPasswordTokenExpiry = Date.now() + 9000000;

    console.log(resetToken);

    await userModel.updateOne(
      { emailid: emailid },
      {
        $set: {
          resetPasswordToken: resetToken,
          resetPasswordTokenExpiry: resetPasswordTokenExpiry,
        },
      }
    );

    await user.save();

    const modifieduser = await userModel.findOne({ emailid: emailid });

    console.log(modifieduser);

    const mailTransporter = createTransport({
      service: "gmail",
      auth: {
        user: "c2hsasi@gmail.com",
        pass: process.env.PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const message = {
      from: "c2hsasi@gmail.com",
      to: "c2hsasi@gmail.com",
      subject: "PASSWORD RESET MAIL",
      //text: `reset token>>>>    ${resetToken}`,
      text: `http://localhost:5173/reset_password/${user._id}/${resetToken}`,
    };

    mailTransporter.sendMail(message, (err, info) => {
      if (err) {
        console.log("*****Error in sending mail*****", err);
        return res.status(500).json({ message: "error in reseting password" });
      }

      console.log("Mail sent successfully");

      res.status(200).json({ message: "Mail sent successfully to emailid" });
    });
  } catch (error) {
    console.log(error);
  }
};

// ***** Reset function *****

export const resetPasswordlink = async (req, res) => {
  console.log("*****Reset function*****");

  try {
    const token = req.body.token;
    const password = req.body.password;

    console.log(token);

    if (!token) {
      return console.log("Token missing");
    }

    const user = await userModel.findOne({ resetPasswordToken: token });
    console.log("*****User*****", user);
    if (!user) {
      console.log("user not found");

      return res.status(200).json({ message: "user not found" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const updatedUser = await userModel.updateOne(
      { resetPasswordToken: token },
      {
        $set: {
          resetPasswordToken: null,
          resetPasswordTokenExpiry: null,
          password: hashPassword,
        },
      }
    );

    console.log(updatedUser);

    res.status(200).json({ message: "Password reset successfully" });
    console.log("Password reset successfully");
  } catch (error) {
    res.status(500).json({ message: "Error in resetting password" });
  }
};
