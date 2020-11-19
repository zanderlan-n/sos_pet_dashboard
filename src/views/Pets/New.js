import React, { useMemo, useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';
import _ from 'lodash';
import { Card, CardBody, CardHeader, Col, Row, Label, Spinner, Button, Input } from 'reactstrap';
import gql from 'graphql-tag';
import useToast from '../../hooks/useToast';
import Image from '../../components/Image';
import loadingView from '../../components/Loading';
import { mappedPetStatus, mappedPetSize } from '../../config/constants';
import './Pets.scss';
import DateField from '../../components/DateField';
import { Select } from 'antd';

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

  const [animalObject, setAnimalObject] = useState({
    color: '',
    last_seen: '',
    description: '',
    size: 'small',
    location: '',
    status: 'lost',
    age: ''
  });

  const handlePetInput = (key, value) => {
    console.log(key);
    console.log(value);

    const object = { ...animalObject, [key]: value };
    setAnimalObject(() => ({ object }))

    console.log(animalObject);
  }

  const { data, loading, error } = useQuery(FETCH_ANIMAL, {
    variables: { id: '5f981aa8fe0f67112c00961a' },
  });

  const pet = useMemo(() => {
    if (!data || loading || error) {
      return {};
    }

    const { animal } = data;

    setAnimalObject(animal);

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

      let label = '';
      let type = 'input';
      let options = [];

      switch (key) {
        case 'color':
          label = 'Cor';
          break;
        case 'last_seen':
          label = 'Última vez visto';
          type = 'date';
          break;
        case 'description':
          label = 'Descrição';
          break;
        case 'size':
          label = 'Tamanho';
          type = 'select';
          options = [
            { label: 'Pequeno', value: 'small' },
            { label: 'Médio', value: 'medium' },
            { label: 'Grande', value: 'big' },
          ];
          break;
        case 'location':
          label = 'Localização';
          break;
        case 'type':
          type = 'select';
          options = [
            { label: 'Gato', value: 'cat' },
            { label: 'Cachorro', value: 'dog' },
          ];
        case 'status':
          label = 'Situação';
          type = 'select';
          options = [
            { label: 'Perdido', value: 'lost' },
            { label: 'Encontrado', value: 'found' },
            { label: 'Para adoção', value: 'forAdoption' },
            { label: 'Adotado', value: 'adopted' },
          ];
          break;
        case 'age':
          label = 'Idade';
          break;
      }

      switch (type) {
        case 'input':
          return (
            <div className="form-group">
              <label >{label ? label : key}</label>
              <Input onChange={(e) => handlePetInput(key, e.target.value)} name={animalObject[key]} value={animalObject[key] ? animal[key] : ''} className="form-control" type="text"></Input>
            </div>
          );
        case 'select':
          return (
            <div className="form-group">
              <label >{label ? label : key}</label>
              <Select onChange={(e) => handlePetInput(key, e)} name={animalObject[key]} defaultValue={animalObject[key] ? animalObject[key] : ''} options={options} className={"form-control"}></Select>
            </div>
          );
        case 'date':
          return (
            <DateField label={label ? label : key} onChange={(e) => handlePetInput(key, e)} disabled={false} value={animalObject[key]}></DateField>
          )
        default:
        return (
          <div>
            <div className="form-group">
              <label >{label ? label : key}</label>
              <Input onChange={(e) => handlePetInput(key, e.target.value)} name={animalObject[key]} value={animalObject[key] ? animalObject[key] : ''} className="form-control" type="text"></Input><Input value={animal[key] ? animal[key] : ''} className="form-control" type="text"></Input>
            </div>
          </div>
        );
      }
    });

    return { data: animal, displayedData };
  }, [data, error, loading]);

  if (loading) {
    return loadingView();
  }

  if (error) {
    toast('Não foi possivel buscar as informações do pet');
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(pet.data);
  }

  const isLoading = false;

  const image = 'http://data.biovet.com.br/file/2018/10/29/H104520-F00000-V006-2000x0.jpeg';

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
                  <Image className="card-img" image={image} />
                  <Button
                    className="ml-auto font-weight-bold text-white mt-2 w-100"
                    color="secondary"
                    type="submit"
                  >
                    {isLoading ? <Spinner size="sm" /> : 'Alterar'}
                  </Button>
                  <Button
                    className="ml-auto font-weight-bold text-white mt-2 w-100"
                    color="danger"
                    type="submit"
                  >
                    {isLoading ? <Spinner size="sm" /> : 'Remover'}
                  </Button>
                </div>
                <div className="col-12 col-sm-8 px-0 pt-3 pt-sm-0 pl-sm-3 d-flex flex-column space-between">
                  {pet.displayedData.map((item) => item)}
                  <Col lg="3" md="4" sm="12" className="d-flex pr-0 pl-0 ml-auto">
                    <Button
                      className="ml-auto font-weight-bold text-white mt-md-5 mt-2 w-100"
                      color="primary"
                      type="submit"
                      disabled={isLoading}
                      onClick={handleSubmit}
                    >
                      {isLoading ? <Spinner size="sm" /> : 'Salvar'}
                    </Button>
                  </Col>
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
