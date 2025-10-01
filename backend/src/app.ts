import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./modules/auth/user.routes";
import { authenticate } from "./middlewares/auth.middleware";
import postRoutes from "./modules/post/post.routes";
// import path from 'path';
const app = express();


const corsOptions = {
  origin: process.env.FRONTEND_URL! || "http://localhost:5173",
  credentials: true,
};
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads'))); 



app.use("/auth", userRoutes);
app.get("/auth/me", authenticate, (req, res) => {
  res.json({ user: req.user }); 
});
app.use('/posts', postRoutes);




export default app;
