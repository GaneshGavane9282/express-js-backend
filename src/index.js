import { app } from './app.js';
import connectDB from './db/index.js';
import dotenv from 'dotenv';
import { VIDEO_TUBE } from './constants.js';

dotenv.config({
    path: './env',
});

const { DEFAULT_PORT } = VIDEO_TUBE;
const port = process.env.PORT || DEFAULT_PORT;

connectDB()
    .then(() => {
        app.on('error', (error) => {
            console.error('Express Mongo DB Error: ', error);
            throw error;
        });

        app.listen(port, () => {
            console.log(`Server is running at port ${port}`);
        });
    })
    .catch((error) => {
        console.error('MONGO DB connection failed! : ', error);
    });
