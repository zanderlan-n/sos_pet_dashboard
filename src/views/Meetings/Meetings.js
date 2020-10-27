import React from 'react';

import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import PetsView from '../../components/views/PetsView';

const Meetings = () => {
  return (
    <div className="animated fadeIn">
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader className="font-weight-bold text-dark">
              Sessões
            </CardHeader>
            <CardBody>
              <PetsView />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Meetings;
