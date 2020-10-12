import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Row,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from 'reactstrap';

import UserComments from './Comments';
import AnimalsView from '../../components/views/AnimalsView';
import Subscriptions from '../Subscriptions/Subscriptions';
import UserDetails from './Details';

const FETCH_USER = gql`
  query user($id: String!) {
    user(id: $id) {
      id
      email
      profile {
        name
        slug
        isFeatured
        isMentor
        isVerified
      }
      isDeleted
    }
  }
`;

const User = () => {
  const { id } = useParams();
  const [queryParam, setQueryParam] = useState(id);
  const [activeTab, setActiveTab] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery(FETCH_USER, {
    variables: { id },
  });

  const user = useMemo(() => {
    if (!data || loading || error) {
      return {};
    }

    return data?.user;
  }, [data, loading, error]);

  const tabsMeta = [
    {
      type: 'details',
      name: 'Detalhes',
      render: (
        <UserDetails user={user} refetch={refetch} loadingUser={loading} />
      ),
      onlyMentor: false,
    },
    {
      type: 'comments',
      name: 'Comentarios',
      render: <UserComments />,
      onlyMentor: true,
    },
    {
      type: 'subscriptions',
      name: 'Inscrições',
      render: <Subscriptions />,
      onlyMentor: false,
    },
    {
      type: 'meetings',
      name: 'Sessões',
      onlyMentor: false,
      render: (
        <AnimalsView
          setQueryParam={setQueryParam}
          queryParam={queryParam}
          showFilter
        />
      ),
    },
  ];

  const tabs = useMemo(() => {
    if (!user) return [];
    return tabsMeta.filter((tab) =>
      user?.profile?.isMentor ? true : !tab.onlyMentor
    );
  }, [tabsMeta, user]);

  return (
    <div className="animated fadeIn">
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader className="font-weight-bold">Usuário</CardHeader>
            <CardBody>
              <Nav tabs>
                {tabs.map((item, i) => (
                  <NavItem className="d-none d-sm-block" key={i}>
                    <NavLink
                      className={`${
                        i === activeTab
                          ? `font-weight-bold  text-primary `
                          : `text-black-80`
                      }`}
                      active={i === activeTab}
                      onClick={() => setActiveTab(i)}
                    >
                      {item.name}
                    </NavLink>
                  </NavItem>
                ))}
                <Dropdown
                  className="d-sm-none "
                  nav
                  isOpen={dropdownOpen}
                  toggle={() => setDropdownOpen(!dropdownOpen)}
                >
                  <DropdownToggle
                    nav
                    caret
                    className="font-weight-bold  text-primary active"
                  >
                    {tabs[activeTab].name}
                  </DropdownToggle>
                  <DropdownMenu>
                    {tabs.map((item, i) => (
                      <DropdownItem
                        active={i === activeTab}
                        key={`responsive-dropdown-${i}`}
                        onClick={() => setActiveTab(i)}
                      >
                        {item.name}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </Nav>
              <TabContent activeTab={tabs[activeTab]} id="user-tabs">
                {tabs.map((item, i) => {
                  return (
                    <TabPane
                      tabId={item}
                      key={`${i}-tab`}
                      role="tabpanel"
                      aria-labelledby={`${item.type}-tab`}
                    >
                      {React.cloneElement(item.render)}
                    </TabPane>
                  );
                })}
              </TabContent>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default User;
