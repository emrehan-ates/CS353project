var express = require('express');

// sırasıyla tüm listingler, listing ekleme, listing silme, sellerın listingleri ve listing güncelleme için routerlar 
var allListingsRouter = express.Router();
var addListingRouter = express.Router();
var deleteListingRouter = express.Router();
var sellerListingsRouter = express.Router();
var updateListingRouter = express.Router();

const getPool = require('../database');   

allListings = (req, res) => {
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
        `;

        client.query(query, (err, result) => {
            if(err) {
                console.log(err.stack);
                res.status(401).send("Get all listings failed");
                release();
                return;
            }
            
            release();
            res.send(result.rows);
        });
    });
}

addListing = (req,res) => {
    let pool = getPool();
    let ses = req.session;
    
    if (ses.loggedIn && ses.user.type == "seller") {
        pool.connect((err, client, release) => {
            if(err) {
                console.log("Error connecting client", err.stack);
                res.status(500).send("Error connecting to database");
                return;
            } 
            title = req.body.title;
            description = req.body.description;
            price = req.body.price;
            make = req.body.make;
            model = req.body.model;
            year = req.body.year;
            mileage = req.body.mileage;
            fuel_type = req.body.fuel_type;
            transmission = req.body.transmission;
            engine_displacement = req.body.engine_displacement;
            color = req.body.color;
            condition = req.body.condition;
            type = req.body.type;
            car_body = req.body.car_body;
            motor_type = req.body.motor_type;
            commercial_type = req.body.commercial_type;

            client.query("INSERT INTO Vehicle (make, year, mileage, price, fuel_type, transmission, engine_displacement, color, condition) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING vehicle_id", [make, year, mileage, price, fuel_type, transmission, engine_displacement, color, condition], (err1, res1) => {
                if(err1) {
                    console.log(err1.stack);
                    res.status(400).send("Add Vehicle failed");
                    return;
                }
                if(type == "car") { 
                    vehicle_id = res1.rows[0].vehicle_id;
                    client.query("INSERT INTO Car (vehicle_id, model, car_body) VALUES ($1, $2, $3)", [vehicle_id, model, car_body], (err2, res2) => {
                        if(err2) {
                            console.log(err2.stack);
                            res.status(400).send("Add Car failed");
                        }
                        let date = new Date().toISOString().substring(0, 10);
                        client.query("INSERT INTO Listing (vehicle_id, seller_id, title, description, created_at, status) VALUES ($1, $2, $3, $4, $5, 'on_sale')", [vehicle_id, ses.user.user_id, title, description, date], (err3, res3) => {
                            if(err3) {
                                console.log(err3.stack);
                                res.status(400).send("Add listing failed");
                            }
                            release();
                            res.send("Add listing successful");
                        });
                    });
                } else if (type == "motorcycle") {
                    vehicle_id = res1.rows[0].vehicle_id;
                    client.query("INSERT INTO Motorcycle (vehicle_id, model, motor_type) VALUES ($1, $2, $3)", [vehicle_id, model, motor_type], (err2, res2) => {
                        if(err2) {
                            console.log(err2.stack);
                            res.status(400).send("Add Motorcycle failed");
                        }
                        let date = new Date().toISOString().substring(0, 10);
                        client.query("INSERT INTO Listing (vehicle_id, seller_id, title, description, created_at, status) VALUES ($1, $2, $3, $4, $5, 'on_sale')", [vehicle_id, ses.user.user_id, title, description, date], (err3, res3) => {
                            if(err3) {
                                console.log(err3.stack);
                                res.status(400).send("Add listing failed");
                            }
                            release();
                            res.send("Add listing successful");
                        });
                    });
                } else if(type == "commercial") {
                    vehicle_id = res1.rows[0].vehicle_id;
                    client.query("INSERT INTO Commercial (vehicle_id, model, commercial_type) VALUES ($1, $2, $3)", [vehicle_id, model, commercial_type], (err2, res2) => {
                        if(err2) {
                            console.log(err2.stack);
                            res.status(400).send("Add Commercial failed");
                        }
                        let date = new Date().toISOString().substring(0, 10);
                        client.query("INSERT INTO Listing (vehicle_id, seller_id, title, description, created_at, status) VALUES ($1, $2, $3, $4, $5, 'on_sale')", [vehicle_id, ses.user.user_id, title, description, date], (err3, res3) => {
                            if(err3) {
                                console.log(err3.stack);
                                res.status(400).send("Add listing failed");
                            }
                            release();
                            res.send("Add listing successful");
                        });
                    });
                } else {
                    res.status(400).send("No matching type");
                }

            });

        });
    }
}

deleteListing = (req, res) => {
    let pool = getPool();
    let ses = req.session;
    if (ses.loggedIn && (ses.user.type == "seller" || ses.user.type == "admin")) {
        pool.connect((err, client, release) => {
            if(err) {
                console.log("Error connecting client", err.stack);
                res.status(500).send("Error connecting to database");
                return;
            } 
            let listing_id = req.body.listing_id;

            client.query("SELECT vehicle_id, type, seller_id FROM Listing WHERE listing_id = $1", [listing_id], (err1, res1) => {
                if(err1) {
                    console.log(err1.stack);
                    res.status(400).send("Error fetching listing");
                    release();
                    return;
                }
                if(res1.rows.length === 0) {
                    res.status(404).send("Listing not found");
                    release();
                    return;
                }

                let vehicle_id = res1.rows[0].vehicle_id;
                let type = res1.rows[0].type;
                let seller_id = res1.rows[0].seller_id;

                let deleteTypeQuery = "";
                if(type == "car") {
                    deleteTypeQuery = "DELETE FROM Car WHERE vehicle_id = $1";
                } else if(type == "motorcycle") {
                    deleteTypeQuery = "DELETE FROM Motorcycle WHERE vehicle_id = $1";
                } else if(type == "commercial") {
                    deleteTypeQuery = "DELETE FROM Commercial WHERE vehicle_id = $1";
                }

                client.query(deleteTypeQuery, [vehicle_id], (err2, res2) => {
                    if(err2) {
                        console.log(err2.stack);
                        res.status(400).send("Error deleting vehicle type");
                        release();
                        return;
                    }

                    client.query("DELETE FROM Listing WHERE listing_id = $1", [listing_id], (err3, res3) => {
                        if(err3) {
                            console.log(err3.stack);
                            res.status(400).send("Error deleting listing");
                            release();
                            return;
                        }

                        client.query("DELETE FROM Vehicle WHERE vehicle_id = $1", [vehicle_id], (err4, res4) => {
                            if(err4) {
                                console.log(err4.stack);
                                res.status(400).send("Error deleting vehicle");
                                release();
                                return;
                            }

                            if (ses.user.type == "admin") {
                                // Insert into Activity table
                                const nickname = ses.user.nickname;
                                const action_type = 'listing_deletion';
                                client.query("INSERT INTO Activity (nickname, action_type, user_id, listing_id) VALUES ($1, $2, $3, $4)", [nickname, action_type, seller_id, listing_id], (err5, res5) => {
                                    if(err5) {
                                        console.log(err5.stack);
                                        res.status(400).send("Error logging activity");
                                        release();
                                        return;
                                    }

                                    release();
                                    res.send("Delete listing successful");
                                });
                            } else {
                                release();
                                res.send("Delete listing successful");
                            }
                        });
                    });
                });
            });
        });
    } else {
        res.status(403).send("Unauthorized");
    }
}

sellerListing = (req, res) => {
    let pool = getPool();
    let ses = req.session;
    if (ses.loggedIn && ses.user.type == "seller") {
        pool.connect((err, client, release) => {
            if(err) {
                console.log("Error connecting client", err.stack);
                res.status(500).send("Error connecting to database");
                return;
            } 
            client.query("SELECT * FROM Listing WHERE seller_id = $1", [ses.user.user_id], (err, result) => {
                if(err) {
                    res.status(401).send("Get seller listings failed");
                    return;
                }
                
                    release();
                    res.send(result.rows);
                
            });
        });
    }
}

updateListing = (req, res) => {
    let pool = getPool();
    let ses = req.session;
    if (ses.loggedIn && ses.user.type == "seller") {
        pool.connect((err, client, release) => {
            if(err) {
                console.log("Error connecting client", err.stack);
                res.status(500).send("Error connecting to database");
                return;
            } 
            title = req.body.title;
            description = req.body.description;
            price = req.body.price;
            make = req.body.make;
            model = req.body.model;
            year = req.body.year;
            mileage = req.body.mileage;
            fuel_type = req.body.fuel_type;
            transmission = req.body.transmission;
            engine_displacement = req.body.engine_displacement;
            color = req.body.color;
            condition = req.body.condition;
            type = req.body.type;
            car_body = req.body.car_body;
            motor_type = req.body.motor_type;
            commercial_type = req.body.commercial_type;
            listing_id = req.body.listing_id;
            
            client.query("SELECT vehicle_id, type FROM Listing WHERE listing_id = $1", [listing_id], (err1, res1) => {
                if(err1) {
                    console.log(err1.stack);
                    res.status(400).send("Error fetching listing");
                    release();
                    return;
                }
                if(res1.rows.length === 0) {
                    res.status(404).send("Listing not found");
                    release();
                    return;
                }
                
                let vehicle_id = res1.rows[0].vehicle_id;
                let type = res1.rows[0].type;
                client.query("UPDATE Vehicle SET make = $1, year = $2, mileage = $3, price = $4, fuel_type = $5, transmission = $6, engine_displacement = $7, color = $8, condition = $9 WHERE vehicle_id = $10", [make, year, mileage, price, fuel_type, transmission, engine_displacement, color, condition, vehicle_id], (err2, res2) => {
                    if(err2) {
                        console.log(err2.stack);
                        res.status(400).send("Error updating vehicle");
                        release();
                        return;
                    }
                    
                    if(type == "car") {
                        client.query("UPDATE Car SET model = $1, car_body = $2 WHERE vehicle_id = $3", [model, car_body, vehicle_id], (err3, res3) => {
                            if(err3) {
                                console.log(err3.stack);
                                res.status(400).send("Error updating car");
                                release();
                                return;
                            }
                        });
                    } else if(type == "motorcycle") {
                        client.query("UPDATE Motorcycle SET model = $1, motor_type = $2 WHERE vehicle_id = $3", [model, motor_type, vehicle_id], (err3, res3) => {
                            if(err3) {
                                console.log(err3.stack);
                                res.status(400).send("Error updating motorcycle");
                                release();
                                return;
                            }
                        });
                    } else if(type == "commercial") {
                        client.query("UPDATE Commercial SET model = $1, commercial_type = $2 WHERE vehicle_id = $3", [model, commercial_type, vehicle_id], (err3, res3) => {
                            if(err3) {
                                console.log(err3.stack);
                                res.status(400).send("Error updating commercial");
                                release();
                                return;
                            }
                        });
                    } else {
                        res.status(400).send("No matching type");
                        release();
                        return;
                    }

                    client.query("UPDATE Listing SET title = $1, description = $2 WHERE listing_id = $3", [title, description, listing_id], (err4, res4) => {
                        if(err4) {
                            console.log(err4.stack);
                            res.status(400).send("Error updating listing");
                            release();
                            return;
                        }
                        release();
                        res.send("Update listing successful");
                    });
                });
            });
            
        });
    }
}


allListingsRouter.get('/all-listings', allListings);
addListingRouter.post('/add-listing', addListing);
deleteListingRouter.post('/delete-listing', deleteListing);
sellerListingsRouter.get('/seller-listings', sellerListing);
updateListingRouter.post('/update-listing', updateListing);
module.exports = {allListingsRouter, addListingRouter, deleteListingRouter, sellerListingsRouter, updateListingRouter};