import React, { useMemo } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';
import _ from 'lodash';
import { Card, CardBody, CardHeader, Col, Row, Label } from 'reactstrap';
import gql from 'graphql-tag';
import useToast from '../../hooks/useToast';
import Image from '../../components/Image';
import loadingView from '../../components/Loading';
import { mappedPetStatus, mappedPetSize } from '../../config/constants';
import './Pets.scss';
import { checkImage, getImgUrl } from '../../components/ImagesBuilder';

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
      image {
        url
      }
      user {
        telephone
      }
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
    if (!data?.animal || loading || error) {
      return null;
    }
    const { animal } = data;
    delete animal.__typename;
    const displayedData = Object.keys(animal).map((key) => {
      if (!animal[key] || key === 'image') {
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
        case 'user':
          icon = 'phone';
          item = animal[key].telephone;
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
    animal.image = animal.image.length > 0 ? animal.image[0].url : null;
    return { data: animal, displayedData };
  }, [data, error, loading]);

  if (loading) {
    return loadingView();
  }
  if (error) {
    toast('Não foi possivel buscar as informações do pet');
  }

  const handleWhatsapp = () => {
    const fullUrl = encodeURIComponent(window.location.href + window.location.pathname);
    window.open("https://wa.me/?text=Olha só! Encontrei um pet que pode ser do seu interesse! " + fullUrl, "_blank");
  };

  const handleFacebook = () => {
    const fullUrl = encodeURIComponent(window.location.href + window.location.pathname);
    window.open("https://www.facebook.com/sharer/sharer.php?u=" + fullUrl + "&quote=Olha só! Encontrei um pet que pode ser do seu interesse!", "_blank");
  };

  return (
    <div className="animated fadeIn">
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader className="font-weight-bold">
              {!_.isEmpty(pet) ? mappedPetStatus[pet.data.status] : Pet}
            </CardHeader>
            <CardBody style={{ position: "relative" }}>
              <div className="d-flex justify-content-center flex-column flex-sm-row px-3 px-sm-4">
                <span style={{ fontSize: "22px", marginBottom: "20px", position: "absolute", right: "8px", bottom: "-15px" }}>
                  <i onClick={handleWhatsapp} style={{ marginRight: "5px", cursor: "pointer" }} className={"fa fa-whatsapp"}></i>
                  <i onClick={handleFacebook} style={{ marginLeft: "5px", cursor: "pointer" }} className={"fa fa-facebook"}></i>
                </span>
              </div>

              {pet && (
                <Row className="d-flex flex-column flex-sm-row px-3 px-sm-4">
                  <div className="col-12 col-sm-4 px-0 pr-sm-3">
                    <Image
                      className="card-img"
                      image={
                        pet.data?.image
                          ? getImgUrl(pet.data.image)
                          : checkImage({ url: pet.data?.image, type: 'PET' })
                      }
                    />
                  </div>
                  <div className="col-12 col-sm-8 px-0 pt-3 pt-sm-0 pl-sm-3 d-flex flex-column space-between">
                    {pet.displayedData.map((item) => item)}
                  </div>
                </Row>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

Pet.propTypes = {};

export default Pet;
