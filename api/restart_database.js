const {Pool} = require('pg');

const config = {
    user: 'postgres',
    host: 'localhost',
    database: 'sarisite',
    password: 'sarisite',
    port: 5432,
}

let pool = new Pool(config);

async function drop() {
    let tables = ['User', 'Admin', 'Buyer', 'Seller', 'Phones', 'Activity', 'Massage', 'Vehicle', 'Car', 'Commercial', 'Motorcycle', 'Images', 'Listings', 'Rating'];

    const client = await pool.connect();
    for(table of tables){
        try{
            let out = client.query("Delete Table If Exists " + table);
        } catch(err) {
            console.log(err);
        }

    }
    client.end();
}

async function create() {
    const client = await pool.connect();

    try {
        //Create tables
        await client.query("Create Table Users( user_id serial, password varchar(20) not null, email varchar(45) not null unique, primary key (user_id) );");
        await client.query("create table Admin ( user_id int not null, nickname varchar(20) not null unique, primary key( user_id ), foreign key (user_id) references Users(user_id) );");
        await client.query("Create table Buyer( user_id int not null, forename varchar(25) not null, surname varchar(25) not null, avarage_purchase_rating numeric(2,1), notification_preference varchar(3) check (notification_preference in ('yes', 'no')) not null, foreign key (user_id) references Users(user_id) );");
        await client.query("Create table Seller ( user_id int not null, forename varchar(25) not null, surname varchar(25) not null, avarage_purchase_rating numeric(2,1), notification_preference varchar(3) check (notification_preference in ('yes', 'no')) not null, city varchar(20), province varchar(20), district varchar(20), street varchar(20), postal_code int, Primary key(user_id), Foreign key(user_id) references Users(user_id) );");
        await client.query("Create table Phones ( phone varchar(11) not null, user_id int not_null, Primary key(phone), Foreign key(user_id) references Users(user_id) );");
        await client.query("Create table Vehicle ( vehicle_id serial primary key, make varchar(20) not null, year varchar(4), mileage int, price int not null, fuel_type varchar(25) check (fuel_type in ('gasoline', 'diesel_fuel', 'lpg', 'electricity', 'hybrid')), engine_displacement numeric(3,1), transmission varchar(15) check (transmission in ('manuel', 'automatic', 'semi-automatic')), color varchar(20), condition varchar(15) check (condition in ('heavily_damaged', 'lightly_damaged', 'no_damaged')));");
        await client.query("Create table Car ( vehicle_id int primary key, model varchar(20), car_body varchar(20), Foreign key(vehicle_id) references Vehicle(vehicle_id) );");
        await client.query("Create table Commercial( vehicle_id int primary key, model varchar(20), commercial_type varchar(20), Foreign key(vehicle_id) references Vehicle(vehicle_id) );");
        await client.query("Create table Motorcycle( vehicle_id int primary key, model varchar(20), motor_type varchar(20), Foreign key(vehicle_id) references Vehicle(vehicle_id) );");
        await client.query("Create table Listing( listing_id serial primary key, seller_id int, title varchar(20), description TEXT, vehicle_id int, created_at date, sold_at date, deleted_at date, updated_at date, status varchar(15) check (status in ('sold', 'on_sale', 'deleted')), Foreign key(seller_id) references Users(user_id), Foreign key(vehicle_id) references Vehicle(vehicle_id));");
        await client.query("Create table Activity ( activity_id serial, nickname varchar(20) not null, action_type varchar(20) not null, user_id int, listing_id int, Primary key(activity_id, nickname), Foreign key (nickname) references admin(nickname), Foreign key(user_id) references Users(user_id), Foreign key(listing_id) references Listing(listing_id) );");
        await client.query("Create table Massages ( massage_id serial primary key, receiver_id int not null, sender_id int not null, massage_text TEXT, Foreign key(receiver_id) references Users(user_id), Foreign key(sender_id) references Users(user_id) );");
        await client.query("Create table Image( image_id serial, vehicle_id int, image_data varchar(255) not null unique, image_order int, Primary key(image_id, vehicle_id), Foreign key(vehicle_id) references Vehicle(vehicle_id) );");
        await client.query("Create table Rating( report_id serial primary key, listing_id int, buyer_id int, rating_buyer numeric(2,1), rating_seller numeric(2,1), seller_comment  text, buyer_comment text, Foreign Key(listing_id) references Listing(listing_id), Foreign Key(buyer_id) references Users(user_id) );");


    } catch {
        console.log(err.stack);
    }
    client.end();
}

async function addValues() {
    const client = await pool.connect();
    
    try {
        //adding users
        await client.query("INSERT INTO Users(password, email) VALUES ('123', 'emrehan9933@gmail.com');");
        await client.query("INSERT INTO Users(password, email) VALUES ('1234', 'ali@gmail.com');");
        await client.query("INSERT INTO Users(password, email) VALUES ('12345', 'veli@gmail.com');");
        await client.query("INSERT INTO Users(password, email) VALUES ('111', 'ahmet@gmail.com');");
        await client.query("INSERT INTO Users(password, email) VALUES ('123321', 'selin@gmail.com');");
        await client.query("INSERT INTO Users(password, email) VALUES ('sifre', 'ayse@gmail.com');");

        //adding admins
        await client.query("INSERT INTO Admin (user_id, nickname) VALUES (1, 'emre');");
        await client.query("INSERT INTO Admin (user_id, nickname) VALUES (2, 'yaaAli');");
        
        //adding buyers
        await client.query("INSERT INTO Buyer (user_id, forename, surname, notification_preference) VALUES (3, 'Veli', 'Koca', 'no');");
        await client.query("INSERT INTO Buyer (user_id, forename, surname, notification_preference) VALUES (4, 'Ahmet', 'Özel', ''no);");

        //adding sellers
        await client.query("INSERT INTO Seller (user_id, forename, surname, notification_preference, city, province, district, street, postal_code) VALUES"
            + " (5, 'Selin', 'Sekerci', 'no', 'Istanbul', 'Esenyurt', 'Fatih mah.', '1521 sk.', '34999');"
        );
        await client.query("INSERT INTO Seller (user_id, forename, surname, notification_preference, city, province, district, street, postal_code) VALUES"
            + " (6, 'Ayse', 'Gelin', 'no', 'Ankara', 'Cankaya', 'Beytepe mah.', '5555 sk.', '06800');"
        );

        //adding phones
        await client.query("INSERT INTO Phones (user_id, phone) VALUES (1, '11111111111');");
        await client.query("INSERT INTO Phones (user_id, phone) VALUES (3, '12345678911');");

        //we can start the project without any listings
        //We can also create triggers to delete cars when a listing is deleted

    } catch {
        console.log(err.stack);
    }
    client.end();

}

drop().then(success => create()).then(success => addValues()).then(success => pool.end());

