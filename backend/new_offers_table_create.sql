CREATE TABLE Offers (
    offer_id SERIAL PRIMARY KEY,
    ad_id INT NOT NULL,
    buyer_id INT NOT NULL,
    offer_price INT NOT NULL,
    status VARCHAR(10) CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (ad_id) REFERENCES Listing(listing_id),
    FOREIGN KEY (buyer_id) REFERENCES Users(user_id)
);

CREATE TABLE Payments (
    payment_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    balance NUMERIC(10,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Transactions (
    transaction_id SERIAL PRIMARY KEY,
    offer_id INT NOT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_date TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (offer_id) REFERENCES Offers(offer_id),
    FOREIGN KEY (buyer_id) REFERENCES Users(user_id),
    FOREIGN KEY (seller_id) REFERENCES Users(user_id)
);
