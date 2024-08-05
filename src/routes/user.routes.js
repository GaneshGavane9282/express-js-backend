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
userRouter.route('/current-user').post(verifyJWT, getCurrentUser);
userRouter.route('/update-details').post(verifyJWT, updateDetails);
userRouter.route('/update-avatar').post(verifyJWT, upload.single('avatar'), updateAvatar);
userRouter.route('/update-cover-image').post(verifyJWT, upload.single('coverImage'), updateAvatar);

export default userRouter;
