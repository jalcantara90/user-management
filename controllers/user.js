'use strict'

const fs = require('fs'); // requerimos filesistem para poder trabajar con los ficheros del servidor
const path = require('path'); // requerimos path para poder trabajr con las rutas del servidor

const bcrypt = require('bcrypt-nodejs');
const User = require('../models/user');
const jwt = require('../services/jwt');

function pruebas (req, res) {
    res.status(200).send({ 
        message: 'Probando el controlador de usuario'
    });
}

const saveUser = (req, res) => {
    let user = new User(); // instanciamos el objeto user con el modelo correspondiente
    
    let params = req.body; // recogemos todas las variables que nos lleguen por post

    user.name = params.name;
    user.surname = params.surname;
    user.nickname = params.nickname;
    user.surname = params.surname;
    user.email = params.email;
    user.role = 'role_user';

    if( params.password ) {
        bcrypt.hash(params.password, null, null, function (err, hash) {
            user.password = hash;

            if( user.name != null && user.nickname !=null && user.email != null ) {
                user.save( (err, userStored) => {
                    if (err) {
                        res.status(500).send({message: 'Request Error'});
                    }else {
                        if ( !userStored ) {
                            res.status(404).send({message: 'The user is void'});
                        }else {
                            res.status(200).send({ user: userStored });
                        }
                    }
                })
            }
        })
    }
}

const loginUser = (req, res) => {

    let params = req.body;

    let email = params.email;
    let password = params.password;

    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (err) {
            res.status(500).send({message: 'Request Error'})
        }else {
            if (!user) {
                res.status(404).send({ message: 'The User does not exist '})
            }else {              
                // check if the password is the same of our database
                bcrypt.compare(password, user.password, (err, check)=>{
                    // if the passwords is valid
                    if (check) {
                        // if the param gethash is send in request we generate the token
                        if (params.gethash) {
                            res.status(200).send({ token: jwt.createToken(user) });
                        }else {
                            // if the gethash is not set we return a user information
                            res.status(200).send({ user });
                        }
                    }else { // If password not match
                        res.status(404).send({message: 'The user can not login '});
                    }
                });
            }
        }
    })
}

const updateUser = (req, res) => {

    let userId = req.params.id
    let update = req.body;

    if ( userId != req.user.sub ) {
       return  res.status(500).send({message: 'Have not permission'});
    }

    User.findByIdAndUpdate( userId, update , (err, userUpdated) => {
        if (err) {
            res.status(500).send({message: 'Request Error' });
        }else {
            if ( !userUpdated ) {
                res.status(404).send({ message: 'User not found'});
            }else {
                res.status(200).send({ user: userUpdated })
            }
        }
    })  

}

module.exports = {
    pruebas,
    saveUser,
    updateUser,
    loginUser
}