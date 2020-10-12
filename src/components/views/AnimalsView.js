import React, { useState, useRef, useMemo } from 'react';
import * as _ from 'lodash';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { useHistory, useParams } from 'react-router-dom';
import PT from 'prop-types';
import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import { Badge } from 'reactstrap';
import Pagination from '../Pagination';
import { mappedServiceNames, PAGESIZE } from '../../config/constants';
import Table from '../Table';
import { MinutesToHours } from '../../utils/parsers';
import loadingView from '../Loading';
import CardsGrid from '../CardsGrid';

// const FETCH_ANIMALS = gql`
//   query animals() {
//     animals {
//       id
//     }
//   }
// `;

const mockedAnimals = [
  {
    image:
      'http://data.biovet.com.br/file/2018/10/29/H104520-F00000-V006-2000x0.jpeg',
    location: 'BUENO',
    cor: 'Amarelo',
    tamanho: 'Medio',
  },
  {
    image:
      'http://data.biovet.com.br/file/2018/10/29/H104520-F00000-V006-2000x0.jpeg',
    location: 'BUENO',
    cor: 'Amarelo',
    tamanho: 'Medio',
  },
  {
    image:
      'http://data.biovet.com.br/file/2018/10/29/H104520-F00000-V006-2000x0.jpeg',
    location: 'BUENO',
    cor: 'Amarelo',
    tamanho: 'Medio',
  },
  {
    image:
      'http://data.biovet.com.br/file/2018/10/29/H104520-F00000-V006-2000x0.jpeg',
    location: 'BUENO',
    cor: 'Amarelo',
    tamanho: 'Medio',
  },
];

const handleSearch = (value, filters, setFilters, setActivePage, userId) => {
  if (!userId) {
    setFilters({ ...filters, query: value });
  } else {
    setFilters({ ...filters, id: value });
  }
  setActivePage(1);
};

// const heads = [
//   {
//     minWidth: '4',
//     size: '3',
//     value: 'id',
//     name: 'ID',
//   },
//   {
//     minWidth: '1',
//     size: '1',
//     render: StatusBadge,
//     value: 'status',
//     name: 'Status',
//   },
//   {
//     size: '2',
//     value: ({ mentorProfile }) => mentorProfile.name,
//     name: 'Brainer',
//   },
//   { minWidth: '1', size: '3', value: 'type', name: 'Serviço' },
//   { minWidth: '1', size: '4', value: 'date', name: 'Data' },
// ];

const AnimalsView = () => {
  const { id } = useParams();
  const [activePage, setActivePage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    userId: id,
    query: '',
    id: '',
  });
  // const { data, error, loading } = useQuery(FETCH_MEETINGS, {
  //   variables: {
  //     filters,
  //     skip: (activePage - 1) * PAGESIZE,
  //     limit: PAGESIZE,
  //     fetchPolicy: 'no-cache',
  //   },
  // });

  const animals = useMemo(() => {
    // if (!data || loading || error) {
    //   return [];
    // }

    // const { items, totalCount: total } = data.meetingsForAdmin;
    // setTotalCount(total);
    const items = mockedAnimals;
    return items;
  }, []);

  // const history = useHistory();
  // const onClick = (idMeeting) => history.push(`/meetings/${idMeeting}`);

  const setValue = useRef(
    _.debounce((value) => {
      handleSearch(value, filters, setFilters, setActivePage, id);
    }, 500)
  ).current;

  // if (loading) {
  //   return loadingView();
  // }
  return (
    <div className="animated fadeIn">
      {/* <Table
        data={meetings}
        heads={heads}
        setValue={setValue}
        showFilter
        filterPlaceholder={id ? 'ID da Sessão' : 'Nome ou ID'}
        onClick={onClick}
      />
      <Pagination
        activePage={activePage}
        totalPages={totalCount / PAGESIZE}
        onPageChange={(newPage) => {
          setActivePage(newPage);
        }}
      /> */}
      <CardsGrid data={animals}></CardsGrid>
    </div>
  );
};

export default AnimalsView;
