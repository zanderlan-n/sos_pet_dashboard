/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import PT from 'prop-types';
import './styles.scss';
import preview from '../../assets/img/preview.gif';

const CardsGrid = ({ data }) => {
  const [loaded, setLoaded] = useState(false);

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
              <img
                style={{ display: loaded ? 'block' : 'none' }}
                className="card-img"
                onLoad={() => setLoaded(true)}
                src={item.image}
                alt="pet_image"
              />

              <img
                className="card-img"
                style={{ display: !loaded ? 'block' : 'none' }}
                src={preview}
                alt="pet_image"
              />
              <div className="pb-2">
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
