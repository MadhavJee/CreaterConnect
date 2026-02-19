import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.set("runValidators", true); 

    await mongoose.connect(process.env.MONGO_URI);

    console.log("🔗 MongoDB connected");
  } catch (error) {
    console.error(" ⛓️‍💥MongoDB connection failed", error.message);
    process.exit(1);
  }
};

export default connectDB;