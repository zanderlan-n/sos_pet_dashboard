import React, { useState, useMemo, useRef } from 'react';
import PT from 'prop-types';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Button,
  Badge,
  Input,
  InputGroup,
  InputGroupAddon,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownMenu,
} from 'reactstrap';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import _ from 'lodash';
import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import { PAGESIZE } from '../../config/constants';
import Pagination from '../../components/Pagination';
import Table from '../../components/Table';

const FETCH_LOGS = gql`
  query listLog($limit: Int, $skip: Int, $filters: LogFilter) {
    listLog(limit: $limit, skip: $skip, filters: $filters) {
      items {
        ... on Log {
          id
          source
          description
          action
          createdAt
        }
      }
      totalCount
    }
  }
`;

const logActions = {
  Created: { color: 'bg-primary', text: 'Criação' },
  Edited: { color: 'dark-blue', text: 'Edição' },
  Deleted: { color: 'bg-danger', text: 'Exclusão' },
};

const ActionBadge = ({ value }) => {
  return (
    <Badge className={`mr-2 ${logActions[value].color} text-white`}>
      {logActions[value].text}
    </Badge>
  );
};

const columns = [
  {
    value: 'action',
    name: 'Ação',
    size: '1',
    align: 'center',
    render: ActionBadge,
    minWidth: '1',
  },
  { value: 'description', name: 'Descrição', size: '8', minWidth: '3' },
  {
    value: 'createdAt',
    name: 'Data',
    align: 'center',
    size: '3',
    minWidth: '1',
  },
];

const Logs = () => {
  const [actionFilter, setActionFilter] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filters, setFilters] = useState({});

  const actionFilterOptions = ['Todos', 'Criação', 'Edição', 'Exclusão'];

  const { data, error, loading } = useQuery(FETCH_LOGS, {
    variables: {
      skip: (activePage - 1) * PAGESIZE,
      filters: {
        ...filters,
        ...(actionFilter && {
          action: Object.keys(logActions)[actionFilter - 1],
        }),
      },
    },
    fetchPolicy: 'no-cache',
  });

  const debounceSearch = useRef(
    _.debounce((value) => {
      setFilters({ ...filters, source: value });
      setActivePage(1);
    }, 500)
  ).current;

  const logs = useMemo(() => {
    if (!data || error || loading) {
      return [];
    }

    const { items, totalCount: total } = data.listLog;

    setTotalCount(total);
    return items.map((item) => ({
      ...item,
      createdAt: format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm', {
        locale: pt,
      }),
    }));
  }, [data, error, loading]);

  return (
    <div className="animated fadeIn">
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="font-weight-bold  text-dark">
              Logs
            </CardHeader>
            <CardBody>
              <Col className="mb-4 px-0 d-flex flex-column flex-sm-row">
                <Dropdown
                  isOpen={dropdownOpen}
                  toggle={() => setDropdownOpen(!dropdownOpen)}
                >
                  <DropdownToggle
                    className="font-weight-bold mr-sm-0 w-100 w-sm-0 mb-2 mb-sm-0 px-0"
                    style={{ minWidth: 100 }}
                  >
                    {actionFilterOptions[actionFilter]}{' '}
                    <i className="fa fa-angle-down ml-auto" />
                  </DropdownToggle>
                  <DropdownMenu className="w-100 w-sm-0">
                    {actionFilterOptions.map((item, i) => (
                      <DropdownItem
                        active={i === actionFilter}
                        key={i}
                        onClick={() => setActionFilter(i)}
                      >
                        {item}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>

                <InputGroup className="col-12 col-sm-4 ml-sm-auto p-0">
                  <Input
                    type="text"
                    className="col-12 flex-grow-1 flex-grow-md-0"
                    placeholder="E-mail, usuário ou id"
                    onChange={(e) => debounceSearch(e.target.value)}
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
              <Table data={logs} heads={columns} />
              <Pagination
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

ActionBadge.propTypes = {
  value: PT.string.isRequired,
};

export default Logs;
