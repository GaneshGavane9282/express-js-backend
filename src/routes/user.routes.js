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

const router = Router();

router.route('/register').post(
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

router.route('/login').post(loginUser);

// Secured Route
router.route('/logout').post(verifyJWT, logOutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/change-password').post(verifyJWT, changePassword);
router.route('/current-user').post(verifyJWT, getCurrentUser);
router.route('/update-details').post(verifyJWT, updateDetails);
router.route('/update-avatar').post(verifyJWT, upload.single('avatar'), updateAvatar);
router.route('/update-cover-image').post(verifyJWT, upload.single('coverImage'), updateAvatar);

export default router;
