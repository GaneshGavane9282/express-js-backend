import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from './../utils/ApiError.js';
import { User } from './../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from './../utils/ApiResponse.js';
import jsonwebtoken from 'jsonwebtoken';

const generateAccessRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return {
            accessToken,
            refreshToken,
        };
    } catch (error) {
        throw new ApiError(500, 'Something went wrong while generating Tokens');
    }
};

export const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, userName, password } = req.body || {};

    if ([fullName, email, userName, password].some((field) => !field?.trim())) {
        throw new ApiError(400, 'All fields are required');
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { userName }],
    });

    if (existedUser) {
        throw new ApiError(409, 'User with this email or username already exists');
    }

    const avatarLocalPath = req?.files?.avatar?.[0]?.path;
    const coverLocalPath = req?.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar file is required');
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(400, 'Failed to upload avatar');
    }

    const coverImage = coverLocalPath ? await uploadOnCloudinary(coverLocalPath) : null;

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
        throw new ApiError(500, 'Something went wrong while registering the user');
    }

    res.status(201).json(new ApiResponse(200, createdFoundUser, 'User registered successfully'));
});

export const loginUser = asyncHandler(async (req, res) => {
    const { userName, email, password } = req.body || {};

    if (!(userName || email) || !password) {
        throw new ApiError(400, 'Username or email and password are required');
    }

    const foundUser = await User.findOne({
        $or: [{ userName }, { email }],
    });

    if (!foundUser) {
        throw new ApiError(404, 'User does not exist');
    }

    const isValidPassword = await foundUser.isPasswordCorrect(password);
    if (!isValidPassword) {
        throw new ApiError(401, 'Incorrect credentials');
    }

    const { accessToken, refreshToken } = await generateAccessRefreshTokens(foundUser._id);

    const { password: _, refreshToken: __, ...loggedInUser } = foundUser.toObject();

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Set to true in production
        sameSite: 'Strict', // Adjust based on your needs
    };

    res.status(200)
        .cookie('accessToken', accessToken, cookieOptions)
        .cookie('refreshToken', refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                'User logged in successfully'
            )
        );
});

export const logOutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: null },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, {}, 'User logout successfully'));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req?.cookies?.refreshToken || req.body?.refreshToken;

        if (!incomingRefreshToken) throw new ApiError(401, 'Unauthorized refresh token request');

        const decodedToken = await jsonwebtoken.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);

        if (!user) throw new ApiError(401, 'Invalid refresh token');

        if (incomingRefreshToken !== user?.refreshToken) throw new ApiError(401, 'Refresh token is expired or used');

        const { refreshToken, accessToken } = await generateAccessRefreshTokens(user._id);

        const { refreshToken: _, accessToken: __, ...loggedInUser } = user.toObject();

        res.status(200)
            .cookie('accessToken', accessToken)
            .cookie('refreshToken', refreshToken)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,
                        accessToken,
                        refreshToken,
                    },
                    'Access token refreshed successfully'
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || 'Invalid refresh token');
    }
});
