var express = require('express');
var router = express.Router();
loginRouter = express.Router();
changePwRouter = express.Router();

const getPool = require('../database');

login = (req, res) => {
    let ses = req.session;
    console.log(session, "Login Operation");

    if(!ses.loggedIn){
        //request email and password
        email = req.body.email;
        password = req.body.password;

        let pool = getPool();
        pool.connect((err, client, release) => {
            if(err) {
                console.log("Error connecting client", err.stack);
            } 
            client.query("SELECT user_id FROM Users WHERE email = $1 AND password = $2", [email, password], (err, result) => {
                if(err) {
                   res.status(401).send("Login failed");
                }
                if(result.rows.length == 1){
                    user_id = result.rows[0].user_id;
                    console.log(user_id);
                    req.session.loggedIn = true;
                    req.session.user = {user_id: user_id, email: email};
                    console.log(req.session);

                    //if user is a buyer
                    client.query("SELECT * FROM Buyer WHERE user_id = $1", [user_id], (err1, res1) => {
                        if(err) {
                            console.log(err.stack);
                        }
                        if(result.rows.length == 1){
                            release();
                            req.session.user.type = "buyer";

                            req.session.save();
                            res.send(req.session);
                        }
                        else {
                            //if user is a seller
                            client.query("SELECT * FROM Seller WHERE user_id = $1", [user_id], (err2, res2) => {
                                if(err2) {
                                    console.log(err.stack);
                                }
                                if(res2.rows.length == 1){
                                    release();
                                    req.session.user.type = "seller";

                                    req.session.save();
                                    req.session.box = [];
                                    res.send(req.session);
                                }
                                else {
                                    //if user is an admin
                                    client.query("SELECT * FROM Admin WHERE user_id = $1", [user_id], (err3, res3) => {
                                        if(err3) {
                                            console.log(err.stack);
                                        }
                                        if(res3.rows.length == 1){
                                            release();
                                            req.session.user.type = "admin";
                                            req.session.user.nickname = res3.rows[0].nickname;

                                            req.session.save();
                                            req.session.box = [];
                                            res.send(req.session);
                                        }
                                    })
                                }
                            })
                        }
                    })
                } else {
                    release();
                    req.session.loggedIn = false;
                    req.session.save();
                    res.send(req.session);
                }
            });


        })
        
    }
    else {
        res.send(req.session);
    }
}

changePassword = (req, res) => {
    email = req.body.email;
    oldPassword = req.body.oldPassword;
    newPassword = req.body.newPassword;

    let pool = getPool();
    pool.connect((err, client, release) => {
        if(err) {
            console.log("Error connecting client", err.stack);
        }
        client.query("SELECT * FROM Users WHERE email = $1 AND password = $2", [email, oldPassword], (err, result) => {
            if(err) {
                res.status(401).send("Password change failed");
            }
            if(result.rows.length == 1){
                client.query("UPDATE Users SET password = $1 WHERE email = $2", [newPassword, email], (err1, result1) => {
                    if(err1) {
                        res.status(401).send("Password change failed"); 
                    }
                    release();
                    res.send("Password changed successfully");
                })
            }
            else {
                release();
                res.status(401).send("Password change failed");
            }
        })
    })
}

loginOperationRouter.post('/login', login);
changePwRouter.post('/changePassword', changePassword);

module.exports = {loginRouter, changePwRouter};s