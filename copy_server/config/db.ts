import console from "console";
import mongoose from "mongoose";

const connectDB = async ()=>{
   mongoose.connection.on('connected', async ()=> console.log("MONGODB connected"));

   if(!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not defined");
   await mongoose.connect(process.env.MONGODB_URI);
   
}

export default connectDB;