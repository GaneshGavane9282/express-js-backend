import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from './../utils/ApiError.js';
import { User } from './../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from './../utils/ApiResponse.js';

export const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, userName, password } = req.body || {};

    if ([fullName, email, userName, password].some((field) => field?.trim() === '')) {
        throw new ApiError(400, 'All fields are required required');
    }

    const existedUser = User.findOne({
        $or: [{ email }, { userName }],
    });

    if (existedUser) {
        throw new ApiError(409, 'User with email or userName already exist');
    }

    const avatarLocalPath = req?.files?.avatar[0]?.path;
    const coverLocalPath = req?.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar file is required');
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverLocalPath);

    if (!avatar) {
        throw new ApiError(400, 'Avatar file is required');
    }

    const user = await User.create({
        fullName,
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
        password,
        userName: userName.toLowerCase(),
    });

    const createdFoundUser = await User.findById(user._id).select('-password -refreshToken');

    if (!createdFoundUser) {
        throw new ApiError(500, 'Something went wrong while registering user');
    }

    res.status(201).json(new ApiResponse(200, createdFoundUser, 'User registered Successfully'));
});

export const loginUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: 'ok',
    });
});
