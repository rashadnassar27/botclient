import React, { useState } from 'react';
import './CreditCardDialog.css'; // Import CSS file for styling

const CreditCardDialog = ({ isOpen, onClose }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCVV] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      // Ensure only numbers are entered for card number
      setCardNumber(value.replace(/\D/g, ''));
    } else if (name === 'expiryDate') {
      // Ensure only numbers and / are entered for expiry date
      setExpiryDate(value.replace(/[^\d/]/g, ''));
    } else if (name === 'cvv') {
      // Ensure only numbers are entered for CVV
      setCVV(value.replace(/\D/g, ''));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can perform validation and submit the form data here
    console.log('Submitted:', { cardNumber, expiryDate, cvv });
    // Clear input fields
    setCardNumber('');
    setExpiryDate('');
    setCVV('');
    // Close the dialog
    onClose();
  };

  return (
    isOpen && (
      <div className="credit-card-dialog-overlay">
        <div className="credit-card-dialog">
          <h2>Enter Credit Card Information</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Card Number:</label>
              <input
                type="text"
                name="cardNumber"
                value={cardNumber}
                onChange={handleInputChange}
                maxLength="16"
                required
                className="input-field"
              />
            </div>
            <div className="input-group">
              <label>Expiry Date:</label>
              <input
                type="text"
                name="expiryDate"
                value={expiryDate}
                onChange={handleInputChange}
                maxLength="5"
                placeholder="MM/YY"
                required
                className="input-field"
              />
            </div>
            <div className="input-group">
              <label>CVV:</label>
              <input
                type="text"
                name="cvv"
                value={cvv}
                onChange={handleInputChange}
                maxLength="3"
                required
                className="input-field"
              />
            </div>
            <button type="submit" className="submit-button">Pay</button>
          </form>
          <button className="close-button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    )
  );
};

export default CreditCardDialog;