import React, { useState, useEffect } from 'react';

const ParcelLogger = () => {
  const [apartments, setApartments] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [selectedApartment, setSelectedApartment] = useState('');

  useEffect(() => {
    // Fetch apartment options from the server
    fetch('http://localhost:3000/apartments')
      .then((response) => response.json())
      .then((apartments) => {
        setApartments(apartments);
        fetchAndDisplayDeliveries();
      })
      .catch((error) => {
        console.error('Error fetching apartments:', error);
      });
  }, []);

  const fetchAndDisplayDeliveries = (apartmentId = null) => {
    let url = 'http://localhost:3000/deliveries';
    if (apartmentId) {
      url = `http://localhost:3000/deliveries?apartment_id=${apartmentId}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((deliveries) => {
        setDeliveries(deliveries);
      })
      .catch((error) => {
        console.error('Error fetching existing deliveries:', error);
      });
  };

  const handleApartmentChange = (event) => {
    setSelectedApartment(event.target.value);
    fetchAndDisplayDeliveries(event.target.value);
  };

  const handleFilterChange = (event) => {
    const selectedApartmentId = event.target.value || null;
    fetchAndDisplayDeliveries(selectedApartmentId);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const delivery = {
      apartment_id: formData.get('apartment'),
      courier: formData.get('courier'),
      adresse_name: formData.get('addressName'),
      description: formData.get('description'),
      delivery_date: formData.get('deliveryDate'),
      delivery_time: formData.get('deliveryTime'),
      status: false,
    };

    try {
      const response = await fetch('http://localhost:3000/deliveries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(delivery),
      });

      if (response.ok) {
        alert('Delivery submitted successfully');
        event.target.reset();
        fetchAndDisplayDeliveries(delivery.apartment_id);
      } else {
        alert('Error submitting delivery');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting the delivery');
    }
  };

  const handleStatusUpdate = (deliveryId, newStatus) => {
    fetch(`http://localhost:3000/deliveries/${deliveryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((response) => {
        if (response.ok) {
          console.log('Delivery status updated successfully');
          fetchAndDisplayDeliveries(selectedApartment);
        } else {
          console.error('Error updating delivery status');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="container">
      <h2 className="mb-4">Add Delivery</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="form-group">
          <label htmlFor="apartment">Apartment:</label>
          <select id="apartment" name="apartment" className="form-control" required>
            <option value="">Select an apartment</option>
            {apartments.map((apartment) => (
              <option key={apartment.id} value={apartment.id}>
                {apartment.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="courier">Courier:</label>
          <input type="text" id="courier" name="courier" className="form-control" required />
        </div>
        <div className="form-group">
          <label htmlFor="addressName">Address Name:</label>
          <input type="text" id="addressName" name="addressName" className="form-control" required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <input type="text" id="description" name="description" className="form-control" required />
        </div>
        <div className="form-group">
          <label htmlFor="deliveryDate">Delivery Date:</label>
          <input type="date" id="deliveryDate" name="deliveryDate" className="form-control" required />
        </div>
        <div className="form-group">
          <label htmlFor="deliveryTime">Delivery Time:</label>
          <input type="time" id="deliveryTime" name="deliveryTime" className="form-control" required />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>

      <div className="form-group">
        <label htmlFor="apartmentFilter">Filter by Apartment:</label>
        <select id="apartmentFilter" className="form-control" onChange={handleFilterChange}>
          <option value="">All Apartments</option>
          {apartments.map((apartment) => (
            <option key={apartment.id} value={apartment.id}>
              {apartment.name}
            </option>
          ))}
        </select>
      </div>

      <div className="existing-deliveries">
        <h2 className="mb-4">Existing Deliveries</h2>
        <ul className="list-group">
        {deliveries.map((delivery) => (
  <li key={delivery.id} className="list-group-item delivery-item">
    <div className="d-flex flex-column">
      <div>
        <p className="mb-1">
          Courier: {delivery.courier}, Address Name: {delivery.adresse_name}, Description:{' '}
          {delivery.description}, Delivery Date:{' '}
          {new Date(delivery.delivery_date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}{' '}
          , Delivery Time: {delivery.delivery_time}
        </p>
        <p className="mb-0">Status: {delivery.status ? 'Delivered' : 'Pending'}</p>
      </div>
      <div>
        <button
          className={`btn btn-sm ${delivery.status ? 'btn-warning' : 'btn-success'}`}
          onClick={() => handleStatusUpdate(delivery.id, !delivery.status)}
        >
          {delivery.status ? 'Mark as Pending' : 'Mark as Delivered'}
        </button>
      </div>
    </div>
  </li>
))}

        </ul>
      </div>
    </div>
  );
};

export default ParcelLogger;