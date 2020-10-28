/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PT from 'prop-types';
import './styles.scss';
import { useHistory } from 'react-router-dom';

const CardsGrid = ({ data }) => {
  return (
    <>
      <div className="card-wrapper">
        {data.map((item) => {
          return (
            <div
              className="inner-card cursor-pointer"
              onClick={() => {
                item.action(item.id);
              }}
            >
              <img className="card-img" src={item.image} alt="pet_image" />
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
