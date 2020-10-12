import React, { useState } from 'react';
import PT from 'prop-types';
import {
  Table as StrapTable,
  Alert,
  Col,
  InputGroup,
  Input,
  InputGroupAddon,
  Button,
} from 'reactstrap';
import './styles.scss';

const CardsGrid = ({ data }) => {
  const [error, setError] = useState('');

  return (
    <>
      <div className="card-wrapper">
        {data.map((item) => {
          console.log(item);
          return (
            <div className="card">
              <img className="card-img" src={item.image} alt="image_img"></img>
              <div>
                <span></span>
                <span>{item.cor}</span>
              </div>
              <div>
                <span></span>
                <span>{item.location}</span>
              </div>
              <div>
                <span></span>
                <span>{item.tamanho}</span>
              </div>
              <div>TESTE</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

CardsGrid.propTypes = {
  //   heads: PT.arrayOf(PT.object).isRequired,
  data: PT.arrayOf(PT.object).isRequired,
  //   refetch: PT.func,
  //   setValue: PT.func,
  //   showFilter: PT.bool,
  //   filterPlaceholder: PT.string,
  //   onClick: PT.func,
};

// Table.propTypes = {
//   heads: PT.arrayOf(PT.object).isRequired,
//   data: PT.arrayOf(PT.object).isRequired,
//   refetch: PT.func,
//   setValue: PT.func,
//   showFilter: PT.bool,
//   filterPlaceholder: PT.string,
//   onClick: PT.func,
// };

// Table.defaultProps = {
//   refetch: () => {},
//   setValue: () => {},
//   showFilter: false,
//   filterPlaceholder: null,
//   onClick: () => {},
// };

export default CardsGrid;
