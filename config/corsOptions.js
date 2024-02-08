// Cross Origin Resource Sharing
import allowedOrigins from '../config/allowedOrigins.js'

const corsOptions = {
    
    origin: (origin, callback) => {
        //console.log("origin",origin);
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
}
export default corsOptions;