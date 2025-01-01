let express = require('express');
var getBuyerInfo = express.Router();
var getSellerInfo = express.Router();
var setBuyerInfo = express.Router();
var setSellerInfo = express.Router();

/*
    user info sayfası için get ve set metotları, buyer ve seller için ayrı ayrı
    info gösterdiğimiz partları editlenebilir yapalım, post için butona basıldığında set metotları çalışsın
*/
const getPool = require('../database');
const { get } = require('./users');


getBuyerInfo = (req, res) => {

    let ses = req.session;
    console.log(ses, "Get Buyer Info Operation");

    if(ses.loggedIn && ses.user.type == "buyer"){
        let pool = getPool();
        pool.connect((err, client, release) => {
            if(err) {
                console.log("Error connecting client", err.stack);
            } 
            client.query("SELECT * FROM Buyer NATURAL JOIN Users NATURAL JOIN Phones WHERE user_id = $1", [ses.user.user_id], (err, result) => {
                if(err) {
                    res.status(401).send("Get Buyer Info failed");
                }
                
                    release();
                    res.send(result.rows);
                
            });
        });
    }
    else {
        res.status(401).send("Get Buyer Info failed");
    }

}

getSellerInfo = (req, res) => {
    let ses = req.session;
    console.log(ses, "Get Seller Info Operation");

    if(ses.loggedIn && ses.user.type == "seller"){
        let pool = getPool();
        pool.connect((err, client, release) => {
            if(err) {
                console.log("Error connecting client", err.stack);
            } 
            client.query("SELECT * FROM Seller NATURAL JOIN Users NATURAL JOIN Phones WHERE user_id = $1", [ses.user.user_id], (err, result) => {
                if(err) {
                    res.status(401).send("Get Seller Info failed");
                }
                
                    release();
                    res.send(result.rows);
                
            });
        });
    }
    else {
        res.status(401).send("Get Seller Info failed");
    }
}

setBuyerInfo = (req, res) => {
    
    let ses = req.session;
    console.log(ses, "Set Buyer Info Operation");

    if(ses.loggedIn && ses.user.type == "buyer"){
        let pool = getPool();
        pool.connect((err, client, release) => {
            if(err) {
                console.log("Error connecting client", err.stack);
            } 
            forename = req.body.forename;
            surname = req.body.surname;
            email = req.body.email;
            password = req.body.password;
            phone = req.body.phone;
            client.query("UPDATE Users SET email = $1, password = $2 WHERE user_id = $3", [email, password, ses.user.user_id], (err1, res1) => {
                if(err1) {
                    console.log(err1.stack);
                    res.status(400).send("Set Buyer Info failed1");
                }
                client.query("UPDATE Buyer SET forename = $1, surname = $2 WHERE user_id = $3", [forename, surname, ses.user.user_id], (err2, res2) => {
                    if(err2) {
                        console.log(err2.stack);
                        res.status(400).send("Set Buyer Info failed2");
                    }
                    client.query("UPDATE Phones SET phone = $1 WHERE user_id = $2", [phone, ses.user.user_id], (err3, res3) => {
                        if(err3) {
                            console.log(err3.stack);
                            res.status(400).send("Set Buyer Info failed3");
                        }
                        release();
                        res.send("Set Buyer Info successful");
                    });
                });
            });
        });
    }
    else {
        res.status(401).send("Set Buyer Info failed");
    }
}

setSellerInfo = (req, res) => {
    
    let ses = req.session;
    console.log(ses, "Set Seller Info Operation");

    if(ses.loggedIn && ses.user.type == "seller"){
        let pool = getPool();
        pool.connect((err, client, release) => {
            if(err) {
                console.log("Error connecting client", err.stack);
            } 
            forename = req.body.forename;
            surname = req.body.surname;
            email = req.body.email;
            password = req.body.password;
            phone = req.body.phone;
            city = req.body.city;
            province = req.body.province;
            district = req.body.district;
            street = req.body.street;
            postal_code = req.body.postal_code;
            client.query("UPDATE Users SET email = $1, password = $2 WHERE user_id = $3", [email, password, ses.user.user_id], (err1, res1) => {
                if(err1) {
                    console.log(err1.stack);
                    res.status(400).send("Set Seller Info failed1");
                }
                client.query("UPDATE Seller SET forename = $1, surname = $2, city = $3, province = $4, district = $5, street = $6, postal_code = $7 WHERE user_id = $8", [forename, surname, city, province, district, street, postal_code, ses.user.user_id], (err2, res2) => {
                    if(err2) {
                        console.log(err2.stack);
                        res.status(400).send("Set Seller Info failed2");
                    }
                    client.query("UPDATE Phones SET phone = $1 WHERE user_id = $2", [phone, ses.user.user_id], (err3, res3) => {
                        if(err3) {
                            console.log(err3.stack);
                            res.status(400).send("Set Seller Info failed3");
                        }
                        release();
                        res.send("Set Seller Info successful");
                    });
                });
            });
        });
    }
    else {
        res.status(401).send("Set Seller Info failed");
    }
}



getBuyerInfo.get('/buyer-info', getBuyerInfo);
getSellerInfo.get('/seller-info', getSellerInfo);
setBuyerInfo.post('/buyer-info', setBuyerInfo);
setSellerInfo.post('/seller-info', setSellerInfo);
module.exports = {getBuyerInfo, getSellerInfo, setBuyerInfo, setSellerInfo};