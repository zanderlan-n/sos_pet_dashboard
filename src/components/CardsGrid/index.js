import React from 'react';
import PT from 'prop-types';
import './styles.scss';

const CardsGrid = ({ data }) => {
  return (
    <>
      <div className="card-wrapper">
        {data.map((item) => {
          return (
            <div className="inner-card">
              <img className="card-img" src={item.image} alt="image_img" />
              <div>
                {Object.keys(item.data).map((key) => {
                  return item.data[key];
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

CardsGrid.propTypes = {
  data: PT.arrayOf(PT.object).isRequired,
};

export default CardsGrid;
