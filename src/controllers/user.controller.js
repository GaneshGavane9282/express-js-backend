import { asyncHandler } from '../utils/asyncHandler.js';

export const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: 'ok',
    });
});

export const loginUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: 'ok',
    });
});
