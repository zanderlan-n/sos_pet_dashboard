import React, { useMemo } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';
import _ from 'lodash';
import { Card, CardBody, CardHeader, Col, Row, Label } from 'reactstrap';
import gql from 'graphql-tag';
import useToast from '../../hooks/useToast';
import loadingView from '../../components/Loading';
import { mappedPetStatus, mappedPetSize } from '../../config/constants';
import './Pets.scss';

const FETCH_ANIMAL = gql`
  query animal($id: ID!) {
    animal(id: $id) {
      color
      last_seen
      description
      size
      location
      status
      age
    }
  }
`;
const Pet = () => {
  const { id } = useParams();
  const toast = useToast();

  const { data, loading, error } = useQuery(FETCH_ANIMAL, {
    variables: { id },
  });

  const pet = useMemo(() => {
    if (!data || loading || error) {
      return {};
    }
    const { animal } = data;
    delete animal.__typename;
    const displayedData = Object.keys(animal).map((key) => {
      if (!animal[key]) {
        return null;
      }
      let icon;
      let item = animal[key];
      switch (key) {
        case 'status':
          item = mappedPetStatus[animal[key]];
          icon = 'bullhorn';
          break;
        case 'description':
          icon = 'comment-o';
          break;
        case 'color':
          icon = 'paint-brush';
          break;
        case 'location':
          icon = 'map-marker';
          break;
        case 'age':
          icon = 'birthday-cake';
          break;
        case 'last_seen':
          icon = 'calendar-times-o';
          break;
        case 'size':
          icon = 'arrows-h';
          item = mappedPetSize[animal[key]];
          break;
        default:
          icon = 'paw';
      }
      return (
        <div className="px-2 pt-2">
          <i className={`fa fa-${icon}`} />
          <Label className="ml-2">{item}</Label>
        </div>
      );
    });

    return { data: animal, displayedData };
  }, [data, error, loading]);

  if (loading) {
    return loadingView();
  }
  if (error) {
    toast('Não foi possivel buscar as informações do pet');
  }

  const image =
    'http://data.biovet.com.br/file/2018/10/29/H104520-F00000-V006-2000x0.jpeg';
  return (
    <div className="animated fadeIn">
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader className="font-weight-bold">
              {!_.isEmpty(pet) ? mappedPetStatus[pet.data.status] : Pet}
            </CardHeader>
            <CardBody>
              <Row className="d-flex flex-column flex-sm-row px-3 px-sm-4">
                <div className="col-12 col-sm-4 px-0 pr-sm-3">
                  <img className="card-img" src={image} alt="image_img" />
                </div>
                <div className="col-12 col-sm-8 px-0 pt-3 pt-sm-0 pl-sm-3 d-flex flex-column space-between">
                  {pet.displayedData.map((item) => item)}
                </div>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

Pet.propTypes = {};

export default Pet;
