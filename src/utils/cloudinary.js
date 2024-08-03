import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View Credentials' below to copy your API secret
});

export const uploadOnCloudinary = async (localFilePath) => {
    try {
      
        if (!localFilePath) return null;

        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        });
        // file has been uploaded successfully
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {

        // Remove the locally saved file as the uploaded operation is failed
        fs.unlinkSync(localFilePath);
        return null;

    }
};
