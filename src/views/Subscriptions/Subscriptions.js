import React, { useState, useMemo, useRef } from 'react';
import PT from 'prop-types';
import { useParams } from 'react-router-dom';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { format } from 'date-fns';
import _ from 'lodash';
import {
  Col,
  Row,
  InputGroup,
  Input,
  InputGroupAddon,
  Button,
  Badge,
  Card,
  CardHeader,
  CardBody,
} from 'reactstrap';

import { PAGESIZE, filteredSubscriptionStatus } from '../../config/constants';
import Pagination from '../../components/Pagination';
import Table from '../../components/Table';

const FETCH_SUBSCRIPTIONS = gql`
  query userSubscriptions(
    $filters: SubscriptionFilter
    $query: String
    $skip: Int
  ) {
    userSubscriptions(filters: $filters, query: $query, skip: $skip) {
      items {
        ...SubscriptionParts
      }
      totalCount
    }
  }

  fragment SubscriptionParts on Subscription {
    id
    status
    mentorProfile {
      email
    }
    subscriberProfile {
      email
    }
    serviceData {
      type
    }
    createdAt
    paidAt
  }
`;

const StatusBadge = ({ value }) => {
  const options = {
    Cancelled: {
      text: 'Cancelado',
      color: 'bg-danger',
    },
    Created: {
      text: 'Criado',
      color: 'bg-info',
    },
    Approved: {
      text: 'Aprovado',
      color: 'bg-primary',
    },
    Rejected: {
      text: 'Rejeitado',
      color: 'bg-danger',
    },
    Paid: {
      text: 'Pago',
      color: 'dark-blue',
    },
    Archived: {
      text: 'Arquivado',
      color: 'bg-dark',
    },
  };

  return (
    <Badge className={`mr-2 text-white ${options[value].color} `}>
      {options[value].text}
    </Badge>
  );
};

const columns = [
  {
    value: 'id',
    name: 'ID',
    size: '2',
    minWidth: '4',
  },
  {
    value: 'status',
    name: 'Status',
    render: StatusBadge,
    size: '2',
    align: 'center',
    minWidth: '2',
  },
  {
    value: ({ mentorProfile }) => mentorProfile.email,
    name: 'Brainer',
    size: '3',
    minWidth: '4',
  },
  {
    value: ({ subscriberProfile }) => subscriberProfile?.email,
    name: 'Impulsionado',
    size: '3',
    minWidth: '4',
  },
  {
    value: 'createdAt',
    name: 'Data da inscrição',
    size: '2',
    align: 'center',
    minWidth: '2',
  },
];

const Subscriptions = () => {
  const { id } = useParams();

  const [activePage, setActivePage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [query, setQuery] = useState('');

  const setSearch = useRef(
    _.debounce((value) => {
      setQuery(value);
      setActivePage(1);
    }, 500)
  ).current;

  const { error, data, loading } = useQuery(FETCH_SUBSCRIPTIONS, {
    variables: {
      skip: (activePage - 1) * PAGESIZE,
      filters: {
        inStatus: filteredSubscriptionStatus,
        ...(id && { user: id }),
      },
      query,
    },
    fetchPolicy: 'no-cache',
  });

  const subscriptions = useMemo(() => {
    if (error || !data || loading) {
      return [];
    }

    const { totalCount: total, items } = data?.userSubscriptions;
    setTotalCount(total);

    if (!items) return [];

    return items.map((item) => ({
      ...item,
      createdAt: format(new Date(item.createdAt), 'dd/MM/yyyy hh:mm'),
      paidAt: item.paidAt
        ? format(new Date(item.paidAt), 'dd/MM/yyyy HH:mm')
        : '-',
    }));
  }, [error, data, loading]);

  return (
    <div className="animated fadeIn">
      <Card>
        <CardHeader className="font-weight-bold">Inscrições</CardHeader>
        <CardBody>
          <Row>
            <Col md="3" className="mb-4 pl-0 ml-auto">
              <InputGroup>
                <Input
                  type="text"
                  id="input1-group2"
                  name="input1-group2"
                  placeholder="ID da inscrição, e-mail ou ID do usuário"
                  onChange={(e) => setSearch(e.target.value)}
                />
                <InputGroupAddon addonType="append">
                  <Button type="button" className="text-white" color="primary">
                    <i className="fa fa-search" />
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <Table data={subscriptions} heads={columns} />
              <Pagination
                activePage={activePage}
                totalPages={totalCount / PAGESIZE}
                onPageChange={(e) => {
                  setActivePage(e);
                }}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};

StatusBadge.propTypes = {
  value: PT.string.isRequired,
};

export default Subscriptions;
