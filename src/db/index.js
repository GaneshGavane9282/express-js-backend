import mongoose from 'mongoose';
import { VIDEO_TUBE } from '../constants.js';

const { DB_NAME } = VIDEO_TUBE;
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log('MONGODB connection error', error);
        process.exit(1);
    }
};

export default connectDB;
