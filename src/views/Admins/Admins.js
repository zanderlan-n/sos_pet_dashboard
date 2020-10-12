import React, { useState, useRef, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import * as _ from 'lodash';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Input,
  InputGroup,
  InputGroupAddon,
  Button,
  Badge,
} from 'reactstrap';

import PaginationComponent from '../../components/Pagination';
import { PAGESIZE } from '../../config/constants';

const FETCH_ADMINS = gql`
  query listUserAdmin($filter: String!, $skip: Int) {
    listUserAdmin(filter: $filter, skip: $skip) {
      items {
        ... on UserAdmin {
          id
          email
          name
          isAdmin
          isDeleted
        }
      }
      totalCount
    }
  }
`;

const headers = ['Nome', 'E-mail', ''];
const badges = {
  isManager: 'Gerente',
  isAdmin: 'Administrador',
  isDeleted: 'Excluido',
};

const handleSearch = (value, setFilter, setActivePage) => {
  setFilter(value);
  setActivePage(1);
};

const getBadges = (user) => {
  return Object.keys(badges).reduce((array, key) => {
    if (user[key]) {
      return array.concat([badges[key]]);
    }
    return array;
  }, []);
};

const checkBadgesColors = (badge) => {
  if (badge === badges.isAdmin) {
    return 'bg-primary text-white';
  }
  if (badge === badges.isManager) {
    return 'dark-blue text-white';
  }
  if (badge === badges.isDeleted) {
    return 'bg-danger text-white';
  }
  return 'bg-secondary';
};

const Admins = () => {
  const history = useHistory();
  const [activePage, setActivePage] = useState(1);
  const [filter, setFilter] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  const value = useRef(
    _.debounce((v) => handleSearch(v, setFilter, setActivePage), 500)
  ).current;

  const { data, error, loading } = useQuery(FETCH_ADMINS, {
    variables: {
      filter,
      skip: (activePage - 1) * PAGESIZE,
    },
    fetchPolicy: 'no-cache',
  });

  const admins = useMemo(() => {
    if (loading || !data?.listUserAdmin || error) {
      return [];
    }

    setTotalCount(data.listUserAdmin.totalCount);
    return data.listUserAdmin.items.map((item) => {
      const { email, name, id, isAdmin, isDeleted } = item;

      return {
        email,
        name,
        id,
        badges: getBadges({
          isAdmin,
          isManager: !isAdmin,
          isDeleted,
        }),
      };
    });
  }, [error, loading, data?.listUserAdmin]);

  return (
    <div className="animated fadeIn">
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="font-weight-bold text-dark d-flex justify-content-between align-items-center">
              Administradores
              <Button
                type="button"
                onClick={() => history.push('/admins/new')}
                className="text-white"
                color="primary"
              >
                <i className="fa fa-plus" />
                <span className="font-weight-bold pl-1">Novo</span>
              </Button>
            </CardHeader>
            <CardBody>
              <Col md="3" className="mb-4 mr-0 pr-0 ml-auto">
                <InputGroup>
                  <Input
                    type="text"
                    id="searchInput"
                    name="searchInput"
                    onChange={(e) => value(e.target.value)}
                    placeholder="Nome ou Email"
                  />
                  <InputGroupAddon addonType="append">
                    <Button
                      type="button"
                      className="text-white"
                      color="primary"
                    >
                      <i className="fa fa-search" />
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
              </Col>
              <Table responsive hover striped>
                <thead>
                  <tr>
                    {headers.map((item, i) => (
                      <th key={`${item}_${i}`} className="w-25" scope="col">
                        {item}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {admins.map((item) => {
                    return (
                      <tr
                        className="cursor-pointer"
                        key={item.id}
                        onClick={() => {
                          history.push(`/admins/${item.id}`);
                        }}
                      >
                        <td className="w-25">{item.name}</td>
                        <td className="w-25">{item.email}</td>
                        <td className="w-25 text-right">
                          {item.badges.map((badge) => (
                            <Badge
                              key={`${item.id}_${badge}`}
                              className={`mr-2 ${checkBadgesColors(badge)} `}
                            >
                              {badge}{' '}
                            </Badge>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              <PaginationComponent
                activePage={activePage}
                totalPages={totalCount / PAGESIZE}
                onPageChange={(e) => {
                  setActivePage(e);
                }}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Admins;
