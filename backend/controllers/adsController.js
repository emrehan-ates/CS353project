const { pool } = require('../db');
const fs = require('fs');
const path = require('path');

// Create Ad
exports.createAd = async (req, res) => {
    const {
        seller_id, title, description, make, year, mileage, price,
        fuel_type, engine_displacement, transmission, color,
        condition, vehicle_type, model, extra_attribute
    } = req.body;

    const images = req.files?.images || [];
    const expertReport = req.files?.expertReport?.[0] || null;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Insert into Vehicle table
        const vehicleResult = await client.query(
            `INSERT INTO Vehicle (make, year, mileage, price, fuel_type, engine_displacement, transmission, color, condition)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING vehicle_id`,
            [make, year, mileage, price, fuel_type, engine_displacement, transmission, color, condition]
        );

        const vehicle_id = vehicleResult.rows[0].vehicle_id;

        // Insert into specific vehicle type table
        if (vehicle_type === 'Car') {
            await client.query(
                `INSERT INTO Car (vehicle_id, model, car_body) VALUES ($1, $2, $3)`,
                [vehicle_id, model, extra_attribute]
            );
        } else if (vehicle_type === 'Motorcycle') {
            await client.query(
                `INSERT INTO Motorcycle (vehicle_id, model, motor_type) VALUES ($1, $2, $3)`,
                [vehicle_id, model, extra_attribute]
            );
        } else if (vehicle_type === 'Van') {
            await client.query(
                `INSERT INTO Commercial (vehicle_id, model, commercial_type) VALUES ($1, $2, $3)`,
                [vehicle_id, model, extra_attribute]
            );
        }

        // Insert into Listing table
        const listingResult = await client.query(
            `INSERT INTO Listing (seller_id, title, description, vehicle_id, created_at, status)
             VALUES ($1, $2, $3, $4, NOW(), 'on_sale') RETURNING listing_id`,
            [seller_id, title, description, vehicle_id]
        );

        const listing_id = listingResult.rows[0].listing_id;

        // Insert images into Image table
        for (const [index, image] of images.entries()) {
            await client.query(
                `INSERT INTO Image (vehicle_id, image_data, image_order) VALUES ($1, $2, $3)`,
                [vehicle_id, image.path, index + 1]
            );
        }

        // Save expert report
        if (expertReport) {
            const reportPath = path.join(__dirname, '../uploads/reports/', `${vehicle_id}_${expertReport.originalname}`);
            fs.renameSync(expertReport.path, reportPath);
        }

        await client.query('COMMIT');
        res.status(201).send({ message: 'Ad created successfully', listing_id });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error creating ad:', error.message);
        res.status(500).send({ error: `Error creating ad: ${error.message}` });
    } finally {
        client.release();
    }
};

// Get All Ads
exports.getAds = async (req, res) => {
    try {
        const { make, price_min, price_max } = req.query;
        let query = `SELECT l.listing_id, l.title, v.make, v.price, l.status 
                     FROM Listing l 
                     JOIN Vehicle v ON l.vehicle_id = v.vehicle_id 
                     WHERE l.status = 'on_sale'`;
        const queryParams = [];

        if (make) query += ` AND v.make = $${queryParams.push(make)}`;
        if (price_min) query += ` AND v.price >= $${queryParams.push(price_min)}`;
        if (price_max) query += ` AND v.price <= $${queryParams.push(price_max)}`;

        const result = await pool.query(query, queryParams);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('❌ Error fetching ads:', error.message);
        res.status(500).send({ error: `Error fetching ads: ${error.message}` });
    }
};

// Get Ad by ID
exports.getAdById = async (req, res) => {
    const { id } = req.params;
    try {
        const adDetails = await pool.query(
            `SELECT l.listing_id, l.title, l.description, v.make, v.year, v.mileage, 
                    v.price, v.color, v.condition, v.transmission, l.status, l.created_at
             FROM Listing l 
             JOIN Vehicle v ON l.vehicle_id = v.vehicle_id 
             WHERE l.listing_id = $1`,
            [id]
        );

        if (adDetails.rows.length === 0) {
            return res.status(404).json({ error: 'Ad not found' });
        }

        const images = await pool.query(
            `SELECT image_data AS path 
             FROM Image 
             WHERE vehicle_id = (SELECT vehicle_id FROM Listing WHERE listing_id = $1)`,
            [id]
        );

        // Assuming the expert report is saved in a path related to the vehicle ID
        const expertReportPath = `/uploads/reports/${adDetails.rows[0].listing_id}_expert_report.pdf`;

        res.status(200).json({
            ...adDetails.rows[0],
            images: images.rows.map(img => img.path),
            expert_report: expertReportPath
        });
    } catch (error) {
        console.error('❌ Error fetching ad details:', error.message);
        res.status(500).json({ error: `Error fetching ad details: ${error.message}` });
    }
};

