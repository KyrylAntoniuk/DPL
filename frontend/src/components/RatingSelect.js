import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const RatingSelect = ({ value, onChange }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="d-flex align-items-center">
      {[...Array(5)].map((star, index) => {
        const ratingValue = index + 1;

        return (
          <label key={index} style={{ cursor: 'pointer', marginRight: '5px' }}>
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => onChange(ratingValue)}
              style={{ display: 'none' }}
            />
            <FaStar
              className="star"
              color={ratingValue <= (hover || value) ? '#ffc107' : '#e4e5e9'}
              size={30}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(null)}
            />
          </label>
        );
      })}
      <span className="ms-2 text-muted">
        {value ? (
            value === 1 ? 'Terrible' :
            value === 2 ? 'Bad' :
            value === 3 ? 'Normal' :
            value === 4 ? 'Good' : 'Excellent'
        ) : 'Select Rating'}
      </span>
    </div>
  );
};

export default RatingSelect;
