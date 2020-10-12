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

const Table = ({
  heads,
  data,
  refetch,
  setValue,
  showFilter,
  filterPlaceholder,
  onClick,
}) => {
  const [error, setError] = useState('');
  const getValue = (itemExtractor, row) => {
    if (typeof itemExtractor === 'function') {
      return itemExtractor(row);
    }

    return row[itemExtractor];
  };
  const commonClasses = (size, align, minWidth) => {
    return `d-flex col-${size} align-items-center justify-content-${align} min-width-${minWidth}`;
  };
  return (
    <>
      {error && <Alert color="danger">{error}</Alert>}
      {showFilter && (
        <Col md="3" className="mb-4 ml-auto pr-0">
          <InputGroup>
            <Input
              type="text"
              id="input1-group2"
              name="input1-group2"
              onChange={(e) => setValue(e.target.value)}
              placeholder={filterPlaceholder || 'Nome ou ID'}
            />
            <InputGroupAddon addonType="append">
              <Button type="button" className="text-white" color="primary">
                <i className="fa fa-search" />
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </Col>
      )}
      <StrapTable responsive striped hover>
        <thead>
          <tr className="d-flex">
            {heads.map(({ name, size, icon, align, minWidth }, i) => {
              return (
                <th className={commonClasses(size, align, minWidth)} key={i}>
                  {icon ? <i className={`fa fa-${icon}`} /> : name}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            return (
              <tr
                className="cursor-pointer d-flex"
                key={item.id}
                onClick={() => onClick(item.id)}
              >
                {heads.map(
                  ({ value, render: Render, size, align, minWidth }, i) => (
                    <td
                      className={commonClasses(size, align, minWidth)}
                      key={i}
                    >
                      {Render ? (
                        <Render
                          itemId={item.id}
                          value={getValue(value, item)}
                          setError={setError}
                          refetch={refetch}
                        />
                      ) : (
                        getValue(value, item)
                      )}
                    </td>
                  )
                )}
              </tr>
            );
          })}
        </tbody>
      </StrapTable>
    </>
  );
};

Table.propTypes = {
  heads: PT.arrayOf(PT.object).isRequired,
  data: PT.arrayOf(PT.object).isRequired,
  refetch: PT.func,
  setValue: PT.func,
  showFilter: PT.bool,
  filterPlaceholder: PT.string,
  onClick: PT.func,
};

Table.defaultProps = {
  refetch: () => {},
  setValue: () => {},
  showFilter: false,
  filterPlaceholder: null,
  onClick: () => {},
};

export default Table;
