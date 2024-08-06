import { Router } from 'express';
import {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateDetails,
    updateAvatar,
    getUserChannelProfile,
    getWatchHistory,
} from './../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from './../middlewares/auth.middleware.js';

const userRouter = Router();

userRouter.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1,
        },
        {
            name: 'coverImage',
            maxCount: 1,
        },
    ]),
    registerUser
);

userRouter.route('/login').post(loginUser);

// Secured Route
userRouter.route('/logout').post(verifyJWT, logOutUser);
userRouter.route('/refresh-token').post(refreshAccessToken);
userRouter.route('/change-password').post(verifyJWT, changePassword);
userRouter.route('/current-user').get(verifyJWT, getCurrentUser);
userRouter.route('/update-details').patch(verifyJWT, updateDetails);
userRouter.route('/update-avatar').patch(verifyJWT, upload.single('avatar'), updateAvatar);
userRouter.route('/update-cover-image').post(verifyJWT, upload.single('coverImage'), updateAvatar);
userRouter.route('/channel/:userName').get(verifyJWT, getUserChannelProfile)
userRouter.route('/watch-history').get(verifyJWT, getWatchHistory)

export default userRouter;
