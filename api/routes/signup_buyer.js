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
        phone = req.body.phone;
        
        client.query("INSERT INTO Users (email, password) VALUES ($1, $2) RETURNING user_id", [email, password], (err1, res1) => {
            if(err1) {
                console.log(err1.stack);
                res.status(400).send("Signup failed");
            }
            user_id = res1.rows[0].user_id;
            console.log(user_id);
            client.query("INSERT INTO Buyer (user_id, forename, surname, notification_preference) VALUES ($1, $2, $3, 'no')", [user_id, forename, surname], (err2, res2) => {
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
});
}

router.post('/buyer-signup', signup);
module.exports = router;