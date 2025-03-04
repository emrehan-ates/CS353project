-- Users Table
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    password VARCHAR(250) NOT NULL,
    email VARCHAR(45) NOT NULL UNIQUE
);

-- Admin Table
CREATE TABLE Admin (
    user_id INT PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Buyer Table
CREATE TABLE Buyer (
    user_id INT PRIMARY KEY,
    forename VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    avarage_purchase_rating NUMERIC(2,1),
    notification_preference VARCHAR(3) CHECK (notification_preference IN ('yes', 'no')) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Seller Table
CREATE TABLE Seller (
    user_id INT PRIMARY KEY,
    forename VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    avarage_purchase_rating NUMERIC(2,1),
    notification_preference VARCHAR(3) CHECK (notification_preference IN ('yes', 'no')) NOT NULL,
    city VARCHAR(20),
    province VARCHAR(20),
    district VARCHAR(20),
    street VARCHAR(20),
    postal_code INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Phones Table
CREATE TABLE Phones (
    phone VARCHAR(11) PRIMARY KEY,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Vehicle Table
CREATE TABLE Vehicle (
    vehicle_id SERIAL PRIMARY KEY,
    make VARCHAR(20) NOT NULL,
    year VARCHAR(4),
    mileage INT,
    price INT NOT NULL,
    fuel_type VARCHAR(25) CHECK (fuel_type IN ('gasoline', 'diesel_fuel', 'lpg', 'electricity', 'hybrid')),
    engine_displacement NUMERIC(3,1),
    transmission VARCHAR(15) CHECK (transmission IN ('manual', 'automatic', 'semi-automatic')),
    color VARCHAR(20),
    condition VARCHAR(15) CHECK (condition IN ('heavily_damaged', 'lightly_damaged', 'no_damaged'))
);

-- Car Table
CREATE TABLE Car (
    vehicle_id INT PRIMARY KEY,
    model VARCHAR(20),
    car_body VARCHAR(20),
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id)
);

-- Commercial Table
CREATE TABLE Commercial (
    vehicle_id INT PRIMARY KEY,
    model VARCHAR(20),
    commercial_type VARCHAR(20),
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id)
);

-- Motorcycle Table
CREATE TABLE Motorcycle (
    vehicle_id INT PRIMARY KEY,
    model VARCHAR(20),
    motor_type VARCHAR(20),
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id)
);

-- Listing Table
CREATE TABLE Listing (
    listing_id SERIAL PRIMARY KEY,
    seller_id INT,
    title VARCHAR(20),
    description TEXT,
    vehicle_id INT,
    created_at DATE,
    sold_at DATE,
    deleted_at DATE,
    updated_at DATE,
    status VARCHAR(15) CHECK (status IN ('sold', 'on_sale', 'deleted')),
    FOREIGN KEY (seller_id) REFERENCES Users(user_id),
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id)
);

-- Activity Table
CREATE TABLE Activity (
    activity_id SERIAL,
    nickname VARCHAR(20) NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    user_id INT,
    listing_id INT,
    PRIMARY KEY(activity_id, nickname),
    FOREIGN KEY (nickname) REFERENCES Admin(nickname),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (listing_id) REFERENCES Listing(listing_id)
);

-- Messages Table
CREATE TABLE Messages (
    message_id SERIAL PRIMARY KEY,
    receiver_id INT NOT NULL,
    sender_id INT NOT NULL,
    message_text TEXT,
    FOREIGN KEY (receiver_id) REFERENCES Users(user_id),
    FOREIGN KEY (sender_id) REFERENCES Users(user_id)
);

-- Image Table
CREATE TABLE Image (
    image_id SERIAL,
    vehicle_id INT,
    image_data VARCHAR(255) NOT NULL UNIQUE,
    image_order INT,
    PRIMARY KEY (image_id, vehicle_id),
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id)
);

-- Rating Table
CREATE TABLE Rating (
    report_id SERIAL PRIMARY KEY,
    listing_id INT,
    buyer_id INT,
    rating_buyer NUMERIC(2,1),
    rating_seller NUMERIC(2,1),
    seller_comment TEXT,
    buyer_comment TEXT,
    FOREIGN KEY (listing_id) REFERENCES Listing(listing_id),
    FOREIGN KEY (buyer_id) REFERENCES Users(user_id)
);

CREATE ROLE postgres WITH LOGIN PASSWORD 'piyanist05';