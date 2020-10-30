import React from 'react';

import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import { useHistory } from 'react-router-dom';
import PetsView from '../../components/views/PetsView';
import { useIsMobile } from '../../hooks/useIsMobile';

const Pets = () => {
  const history = useHistory();
  const isMyPetsView = history.location.pathname === '/my_pets';
  const isMobile = useIsMobile();
  return (
    <div className="animated fadeIn">
      <Row>
        <Col className="px-0 px-md-2" lg={12}>
          {isMobile ? (
            <PetsView />
          ) : (
            <Card>
              <CardHeader className="font-weight-bold  text-dark">
                {isMyPetsView ? 'Meus Pets' : 'Pets'}
              </CardHeader>
              <CardBody>
                <PetsView isMyPetsView={isMyPetsView} />
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Pets;
