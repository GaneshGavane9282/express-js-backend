import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from './../utils/ApiError.js';
import { User } from './../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from './../utils/ApiResponse.js';

const generateAccessRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

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

    if (!(userName || email)) throw new ApiError(400, 'username or password is required');

    const foundUser = await User.findOne({
        $or: [{ userName }, { email }],
    });

    if (!foundUser) throw new ApiError(404, 'User does not exist');

    const isValidPassword = await foundUser.isPasswordCorrect(password);

    if (!isValidPassword) throw new ApiError(401, 'Incorrect user credentials');

    const { accessToken, refreshToken } = await generateAccessRefreshTokens(foundUser._id);

    const { returnPassword, returnRefreshToken, ...loggedInUser } = foundUser.toObject();

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                'User Logged In Successfully'
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

    res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {

    }, "User logout successfully"))
});
