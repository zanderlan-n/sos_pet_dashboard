import React from 'react';

import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import PetsView from '../../components/views/PetsView';
import { useIsMobile } from '../../hooks/useIsMobile';

const Pets = () => {
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
                Pets
              </CardHeader>
              <CardBody>
                <PetsView />
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Pets;
