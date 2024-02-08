import User from  '../model/user.js';

const handleLogout = async (req, res) => {
    // On client, also delete the accessToken
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;

    //Is refresh token in db
    const foundUser = await User.findOne({refreshToken}).exec();
    const prod = process.env.NODE_ENV === "production" ? true : false;
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure:prod });
        return res.sendStatus(204);
    }
    
    foundUser.refreshToken = '';
    const result = await foundUser.save();

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: prod });
    res.sendStatus(204);
}

export default {handleLogout}