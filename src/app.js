import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

export const app = express();

// Used for the getting the request from the particular cors origin
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        Credential: true,
    })
);

// Configuring the json data size from the request
app.use(
    express.json({
        limit: '16kb',
    })
);

// Configuring the urlencoded for getting the data from the URL
// extended is used for getting data from the nested object
app.use(
    express.urlencoded({
        extended: true,
        limit: '16kb',
    })
);

// Configuring for the image data
app.use(express.static('public'));

// Configuring the cookies for performing CURD operation
app.use(cookieParser());

// router import
import userRouter from './routes/user.routes.js';
app.use('/api/v1/users', userRouter);
