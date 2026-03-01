import React from 'react';

const Rating = ({ value, text, color = '#f8e825' }) => {
  return (
    <div className="rating">
      {[1, 2, 3, 4, 5].map((index) => (
        <span key={index}>
          <i
            style={{ color }}
            className={
              value >= index
                ? 'fas fa-star'
                : value >= index - 0.5
                ? 'fas fa-star-half-alt'
                : 'far fa-star'
            }
          ></i>
        </span>
      ))}
      <span className="rating-text">{text && text}</span>
    </div>
  );
};

export default Rating;
