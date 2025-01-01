let express = require('express');
let router = express.Router();
const getPool = require('../database');

signup = (req, res) => {
    
    console.log(req.body);

    let pool = getPool();
    pool.connect((err, client, release) => {
    
        if(err) {
            console.log("Error connecting client", err.stack);
        }

        forename = req.body.forename;
        surname = req.body.surname;
        email = req.body.email;
        password = req.body.password;
        city = req.body.city;
        province = req.body.province;
        district = req.body.district;
        street = req.body.street;
        postal_code = req.body.postal_code;
        phone = req.body.phone;
        
        console.log(forename, surname, email, password, city, province, district, street, postal_code, phone);

        client.query("INSERT INTO Users (email, password) VALUES ($1, $2) RETURNING user_id", [email, password], (err1, res1) => {
            if(err1) {
                console.log(err1.stack);
                res.status(400).send("Signup failed");
            }
            user_id = res1.rows[0].user_id;
            console.log(user_id);
            client.query("INSERT INTO Seller (user_id, forename, surname, city, province, district, street, postal_code, notification_preference) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'no')", [user_id, forename, surname, city, province, district, street, postal_code], (err2, res2) => {
                if(err2) {
                    console.log(err2.stack);
                    res.status(400).send("Signup failed");
                }
                client.query("INSERT INTO Phones (phone, user_id) VALUES ($1, $2)", [phone, user_id], (err3, res3) => {
                    if(err3) {
                        console.log(err3.stack);
                        res.status(400).send("Signup failed");
                    }
                    release();
                    res.send("Signup successful");
                });
            });
});
})
}

router.post('/seller-signup', signup);
module.exports = router;