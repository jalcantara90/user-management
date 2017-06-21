'use strict'

const express = require('express');
const UserController = require('../controllers/user');

const api = express.Router();
const md_auth = require('../middlewares/authenticated');

const multipart = require('connect-multiparty'); // librería que sirve enviar ficheros por http
const md_upload = multipart({ uploadDir: './uploads/users' })


api.post('/user', UserController.saveUser );
api.post('/login', UserController.loginUser)
api.put('/user/:id', md_auth.ensureAuth, UserController.updateUser );
api.delete('/user/:id', md_auth.ensureAuth, UserController.deleteUser );

module.exports = api;