const User = require('../models/user');
const passport = require('passport');
const path = require('path');
const fs = require('fs');

module.exports.profile = async function (req, res)
{
    let user = await User.findById(req.params.id);

    if(user){
        return res.render('user_profile',{
            title:'User Profile',
            curr_user: user,
            profile_user: req.user
        });
    }
    else
    {
        return res.render('home');
    }

}

module.exports.signUp = function(req,res)
{
    return res.render('user_sign_up');
}

module.exports.signIn = function(req,res){
    return res.render('user_sign_in');
}

module.exports.create = function (req,res)
{

    if(req.body.password!=req.body.confirm_password)
    {
        return res.redirect('/users/sign-up');
    }
    
    User.findOne({email:req.email},function(err,user){
        if(err)
        {
            console.log('Error while inserting data',err);
            return;
        }

        if(!user)
        {
            User.create(req.body,function(err,user){
                if(err)
                {
                    console.log('Error while inserting data',err);
                    return;
                }
                console.log(user);
            });
            return res.redirect('/users/sign-in');
        }
        else{
            return res.redirect('back');
        }
    });
}

module.exports.createSession = function(req, res){
    req.flash('success', 'You have successfully loged in');
    return res.redirect('/');
}

module.exports.distroySession = function(req,res){
    req.logout();
    req.flash('success', 'You are loged out');
    return res.redirect('/');
}

module.exports.update = async function(req, res)
{

    if(req.user.id == req.params.id)
    {
        try{
            let user = await User.findById(req.params.id);
            User.uploadAvatar(req, res, function(err){
                if(err){console.log('****Multer error'); return}

                user.name = req.body.name;
                user.email = req.body.email;

                if(req.file)
                {
                    if(user.avatar)
                    {
                        fs.unlinkSync(path.join(__dirname, '..', user.avatar));
                    }
                    user.avatar = User.avatarPath + '/' + req.file.filename;
                }

                console.log(user.avatar);

                user.save();

                return res.redirect('back');
            })

        }catch{
            console.log('Error while updating profile');
            return;
        }
    }else{
        return res.status(401).send('Unauthorised');
    }
}