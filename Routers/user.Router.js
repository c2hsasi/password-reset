import express from "express";
import {
  getUserById,
  loginUser,
  registerUser,
  resetPassword,
  resetPasswordlink,
} from "../Controller/user.Controller.js";
import { authMiddleware } from "../Middleware/auth.middleware.js";

const router = express.Router();

router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.get("/getuser", authMiddleware, getUserById);
router.post("/resetpassword", resetPassword);
router.post("/resetpasswordlink/:_id/:token", resetPasswordlink);

export default router;
