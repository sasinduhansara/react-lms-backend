import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import userRouter from './routes/userRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const connectionString = process.env.MONGO_URI;


mongoose.connect(connectionString)
  .then(() => {
    console.log('MongoDB connected');
   
  })
  .catch(() =>{
    console.log('MongoDB connection failed');
  } );
 
app.use("/api/users",userRouter)

app.listen(5000,(req,res) => {
  console.log('Server is running on port 5000');
})