import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  Badge,
} from 'reactstrap';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import { useHistory } from 'react-router-dom';
import PaginationComponent from '../../components/Pagination';

const FETCHUSERS = gql`
  query users($filter: String!, $skip: Int) {
    users(filter: $filter, skip: $skip) {
      items {
        ... on User {
          id
          email
          profile {
            isMentor
            isFeatured
            isVerified
            slug
            name
          }
          isDeleted
        }
      }
      totalCount
    }
  }
`;
const headers = ['Nome', 'E-mail', 'Slug', ''];

const handleSearch = (value, setFilter, setActivePage) => {
  setFilter(value);
  setActivePage(1);
};

const Users = (props) => {
  const [activePage, setActivePage] = useState(1);
  const [filter, setFilter] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const history = useHistory();

  const value = useRef(
    _.debounce((value) => handleSearch(value, setFilter, setActivePage), 500)
  ).current;
  const badges = {
    isMentor: 'Brainer',
    isFeatured: 'Destacado',
    isVerified: 'Verificado',
    isDeleted: 'Excluido',
  };
  const getBadges = (user) => {
    return Object.keys(badges).reduce((array, key) => {
      if (user[key]) {
        return array.concat([badges[key]]);
      }
      return array;
    }, []);
  };
  const { data, error, loading, refetch } = useQuery(FETCHUSERS, {
    variables: {
      filter,
      skip: activePage - 1,
    },
  });

  useEffect(() => {
    refetch && refetch();
  }, [refetch]);

  const users = useMemo(() => {
    if (loading || !data || !data.users || error) {
      return [];
    }
    setTotalCount(data.users.totalCount);
    return data.users.items.map((item) => {
      return {
        email: item.email,
        name: item.profile.name,
        id: item.id,
        isFeatured: item.profile.isFeatured,
        isMentor: item.profile.isMentor,
        isVerified: item.profile.isVerified,
        slug: item.profile.slug,
        badges: getBadges({ ...item.profile, isDeleted: item.isDeleted }),
      };
    });
  }, [data, error, loading]);

  const checkBadgesColors = (badge) => {
    if (badge === badges.isMentor) {
      return 'bg-primary text-white';
    }
    if (badge === badges.isFeatured) {
      return 'dark-blue text-white';
    }
    if (badge === badges.isDeleted) {
      return 'bg-danger text-white';
    }
    return 'bg-secondary';
  };

  return <div></div>;
};

export default Users;
