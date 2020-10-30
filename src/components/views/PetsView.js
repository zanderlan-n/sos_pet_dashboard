import React, { useState, useMemo, useCallback, useContext } from 'react';

import * as _ from 'lodash';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownMenu,
  Col,
} from 'reactstrap';
import { useHistory } from 'react-router-dom';
import PT from 'prop-types';
import { SessionContext } from '../../context/SessionContext';
import { mappedPetStatus } from '../../config/constants';
import loadingView from '../Loading';
import CardsGrid from '../CardsGrid';

const FETCH_ANIMALS = gql`
  query animals($where: JSON) {
    animals(where: $where) {
      id
      color
      last_seen
      description
      size
      location
      type
      status
      age
    }
  }
`;

const PetsView = ({ isMyPetsView }) => {
  const history = useHistory();
  const [actionFilter, setActionFilter] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const actionFilterOptions = [
    { value: null, label: 'Todos' },
    { value: 'lost', label: 'Perdidos' },
    { value: 'found', label: 'Encontrados' },
    { value: 'forAdoption', label: 'Para Adoção' },
    { value: '', label: 'Adotados' },
  ];
  const { user } = useContext(SessionContext);
  const { data, error, loading } = useQuery(FETCH_ANIMALS, {
    variables: {
      where: {
        ...(isMyPetsView && {
          user: { id: user.id },
        }),
        ...(actionFilter && {
          status: actionFilterOptions[actionFilter].value,
        }),
      },
    },
    fetchPolicy: 'no-cache',
  });
  const handleClick = useCallback(
    (id) => {
      history.push(`/pet/${id}`);
    },
    [history]
  );

  const animals = useMemo(() => {
    if (!data || loading || error) {
      return [];
    }
    return data.animals.map((item) => {
      return {
        data: {
          status: (
            <div className="px-2 pt-2">
              <i className="fa fa-bullhorn" />
              <span className="ml-2">{mappedPetStatus[item.status]}</span>
            </div>
          ),

          description: (
            <div className="px-2 pt-2">
              <i className="fa fa-comment-o" />
              <span className="ml-2">{item.description}</span>
            </div>
          ),
          color: (
            <div className="px-2 pt-2">
              <i className="fa fa-paint-brush" />
              <span className="ml-2">{item.color}</span>
            </div>
          ),
          location: (
            <div className="px-2 pt-2">
              <i className="fa fa-map-marker" />
              <span className="ml-2">{item.location}</span>
            </div>
          ),
        },
        action: handleClick,
        id: item.id,
        image:
          'http://data.biovet.com.br/file/2018/10/29/H104520-F00000-V006-2000x0.jpeg',
      };
    });
  }, [data, error, handleClick, loading]);

  if (loading) {
    return loadingView();
  }
  return (
    <div className="animated fadeIn">
      <Col className="mf-auto mb-4 px-0 d-flex flex-column flex-sm-row">
        <Dropdown
          isOpen={dropdownOpen}
          toggle={() => setDropdownOpen(!dropdownOpen)}
        >
          <DropdownToggle
            className="font-weight-bold mr-sm-0 w-100 w-sm-0 mb-2 mb-sm-0 px-0"
            style={{ minWidth: 100 }}
          >
            {actionFilterOptions[actionFilter].label}{' '}
            <i className="fa fa-angle-down ml-auto" />
          </DropdownToggle>
          <DropdownMenu className="w-100 w-sm-0">
            {actionFilterOptions.map((item, i) => (
              <DropdownItem
                active={i === actionFilter}
                key={i}
                onClick={() => setActionFilter(i)}
              >
                {item.label}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </Col>
      <CardsGrid data={animals} />
    </div>
  );
};

export default PetsView;
PetsView.propTypes = {
  isMyPetsView: PT.bool,
};

PetsView.defaultProps = {
  isMyPetsView: false,
};
