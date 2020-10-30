import React, { useState } from 'react';
import PT from 'prop-types';
import preview from '../assets/img/preview.gif';
import notFound from '../assets/img/not-foud-animal.jpg';

const Image = ({ image }) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <img
        style={{ display: error ? 'block' : 'none' }}
        className="card-img"
        src={notFound}
        alt="pet_image"
      />
      <img
        className="card-img"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{ display: !error ? 'block' : 'none' }}
        src={loaded ? image : preview}
        alt="_image"
      />
    </>
  );
};

Image.propTypes = {
  image: PT.string,
};

Image.defaultProps = {
  image: '',
};
export default Image;
