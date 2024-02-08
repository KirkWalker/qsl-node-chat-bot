import { join } from 'path';
import  bcrypt  from 'bcrypt';
import User from  '../model/user.js';


const handleNewUser = async (req,res) => {
    const {user, pwd } = req.body;
    if(!user || !pwd) return res.status(400).json({'message': 'Username and password are required'});
   
    //check for duplicates
    //console.log(usersDB.users);
    const duplicate = await User.findOne({username:user}).exec();
    if(duplicate) return res.sendStatus(409);
    try{
        //encrypt the password
        const hashedPwd = await bcrypt.hash(pwd, 10);
        //create and store the new user in MongoDB
        const result = await User.create({ 
            "username": user, 
            "password": hashedPwd
        });
        console.log(result);
        res.status(201).json({ 'success': `New user ${user} created!` });
    } catch(err) {
        res.status(500).json({'message': err.message});

    }

}

export default { handleNewUser }