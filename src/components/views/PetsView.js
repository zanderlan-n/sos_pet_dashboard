import React, { useState, useRef, useMemo } from 'react';

import * as _ from 'lodash';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import PT from 'prop-types';
import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import { Badge } from 'reactstrap';
import { useParams, useHistory } from 'react-router-dom';
import Pagination from '../Pagination';
import { mappedPetStatus } from '../../config/constants';
import loadingView from '../Loading';
import CardsGrid from '../CardsGrid';

const FETCH_ANIMALS = gql`
  query animals {
    animals {
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

const PetsView = () => {
  const history = useHistory();
  const { data, error, loading } = useQuery(FETCH_ANIMALS, {
    variables: {
      fetchPolicy: 'no-cache',
    },
  });

  const handleClick = (id) => {
    history.push(`/pet/${id}`);
  };
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
      <CardsGrid data={animals} />
    </div>
  );
};

export default PetsView;
