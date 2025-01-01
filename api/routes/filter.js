let express = require('express');
const session = require('express-session');
const getPool = require('../database');
const { search } = require('./signup_buyer');

let searchListingRouter = express.Router();

searchListing = (req, res) => {
    ses = req.session;
    if(ses.loggedIn){
        search_value = req.query.search_value;

        let pool = getPool();
        pool.connect((err, client, release) => {
            if(err) {
                console.log("Error connecting client", err.stack);
                res.status(500).send("Error connecting to database");
                return;
            } 

            const query = `
                SELECT 
                    Listing.title, 
                    Listing.description, 
                    Listing.created_at, 
                    Vehicle.make, 
                    Vehicle.mileage, 
                    Vehicle.year, 
                    Vehicle.price, 
                    COALESCE(Car.model, Motorcycle.model, Commercial.model) AS model
                FROM 
                    Listing
                JOIN 
                    Vehicle ON Listing.vehicle_id = Vehicle.vehicle_id
                LEFT JOIN 
                    Car ON Vehicle.vehicle_id = Car.vehicle_id
                LEFT JOIN 
                    Motorcycle ON Vehicle.vehicle_id = Motorcycle.vehicle_id
                LEFT JOIN 
                    Commercial ON Vehicle.vehicle_id = Commercial.vehicle_id
                WHERE 
                    Listing.title LIKE $1
            `;

            client.query(query, ['%' + search_value + '%'], (err, result) => {
                if(err) {
                    console.log(err.stack);
                    res.status(401).send("Search failed");
                    release();
                    return;
                }
                
                release();
                res.send(result.rows);
            });
        });
    } else {
        res.status(403).send("Unauthorized");
    }
}

searchListingRouter.get('/search-listing', searchListing);
module.exports = searchListingRouter;