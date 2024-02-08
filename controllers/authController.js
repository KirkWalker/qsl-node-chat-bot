import User from  '../model/user.js';
import  bcrypt  from 'bcrypt';
import  jwt  from 'jsonwebtoken';


const handleLogin = async(req,res) => {
    const {user, pwd } = req.body;
    if(!user || !pwd) return res.status(400).json({'message': 'Username and password are required'});

    const foundUser = await User.findOne({username:user}).exec();
    if (!foundUser) return res.sendStatus(401); //Unauthorized 
    // evaluate password 
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match) {
        const roles = Object.values(foundUser.roles).filter(Boolean);
        // create JWTs
        const accessToken = jwt.sign(
             {
                "UserInfo": {
                    "username": foundUser.username,
                    "roles": roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30s' }
        );
        const refreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        
        // Saving refreshToken with current user
        foundUser.refreshToken = refreshToken;
        const result = await foundUser.save();

        //this cookie needs to be secure in production, not secure in local for the cookie to be recognized by Thunder Client
        const prod = process.env.NODE_ENV === "production" ? true : false;
        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'none', secure: prod, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ roles, accessToken });
    } else {
        res.sendStatus(401);
    }

}

export default {handleLogin}