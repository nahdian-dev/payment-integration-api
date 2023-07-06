CREATE TABLE IF NOT EXISTS payments(
    payment_id INT NOT NULL AUTO_INCREMENT,
    invoice_id VARCHAR(50) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(10) NOT NULL,
    amount INT NOT NULL,
    status VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    users_user_id INT,
    cards_card_id INT,
    PRIMARY KEY(payment_id),
    FOREIGN KEY(users_user_id) REFERENCES Users(user_id),
    FOREIGN KEY(cards_card_id) REFERENCES Cards(card_id)
);