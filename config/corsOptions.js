// Cross Origin Resource Sharing
const whitelist = ['http://127.0.0.1:8080', 'http://localhost:3500'];
const corsOptions = {
    
    origin: (origin, callback) => {
        //console.log("origin",origin);
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
}
export default corsOptions;