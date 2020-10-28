import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import useSession from '../../hooks/useSession';
import loadingView from '../../components/Loading';
import useToast from '../../hooks/useToast';
import PetsView from '../../components/views/PetsView';
import UserDetails from './Details';

const FETCH_USER = gql`
  query user($id: ID!) {
    user(id: $id) {
      id
      email
      telephone
      name
    }
  }
`;

const User = () => {
  const { user } = useSession();
  const toast = useToast();
  const { data, loading, error, refetch } = useQuery(FETCH_USER, {
    variables: { id: user.id },
  });

  const userData = useMemo(() => {
    if (!data || loading || error) {
      return {};
    }
    delete data?.user?.__typename;
    return data?.user;
  }, [data, error, loading]);

  if (loading) {
    return loadingView();
  }
  if (error) {
    toast('Não foi possivel buscar as informações do usuário');
  }
  return (
    <div className="animated fadeIn">
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader className="font-weight-bold">Usuário</CardHeader>
            <CardBody>
              <UserDetails
                user={userData}
                refetch={refetch}
                loadingUser={loading}
                error={error}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default User;
