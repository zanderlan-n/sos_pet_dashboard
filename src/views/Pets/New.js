import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { Card, CardBody, CardHeader, Col, Row, Label, Spinner, Button, Input } from 'reactstrap';

import gql from 'graphql-tag';

import useToast from '../../hooks/useToast';

import useSession from '../../hooks/useSession';

import { Select } from 'antd';

import Image from '../../components/Image';
import loadingView from '../../components/Loading';
import DateField from '../../components/DateField';

import './Pets.scss';

import * as moment from 'moment';
import _ from 'lodash';

const FETCH_ANIMAL = gql`
  query animal($id: ID!) {
    animal(id: $id) {
      id
      age
      size
      color
      status
      location
      last_seen
      description
    }
  }
`;

const CREATE_ANIMAL = gql`
  mutation createAnimal(
    $age: Float!
    $size: ENUM_ANIMAL_SIZE!
    $color: String!
    $status: ENUM_ANIMAL_STATUS!
    $location: String!
    $last_seen: Date!
    $description: String!
    $userId: ID!
  ) {
    createAnimal(
      input: {
        data: {
          age: $age
          size: $size
          color: $color
          status: $status
          location: $location
          last_seen: $last_seen
          description: $description
          user: $userId
        }
      }
    ) {
      animal {
        id,
        user {
          id,
          name
        }
      }
    }
  }
`;

const UPDATE_ANIMAL = gql`
  mutation updateAnimal(
    $id: ID!
    $age: Float!
    $size: ENUM_ANIMAL_SIZE!
    $color: String!
    $status: ENUM_ANIMAL_STATUS!
    $location: String!
    $last_seen: Date!
    $description: String!
  ) {
    updateAnimal(
      input: {
        where: { id: $id }
        data: {
          age: $age
          size: $size
          color: $color
          status: $status
          location: $location
          last_seen: $last_seen
          description: $description
        }
      }
    ) {
      animal {
        id
      }
    }
  }
`;

const Pet = () => {
  const { id } = useParams();
  const toast = useToast();

  const { user } = useSession();

  const history = useHistory();

  const isLoading = false;
  const image = 'http://data.biovet.com.br/file/2018/10/29/H104520-F00000-V006-2000x0.jpeg';

  const [animalObject, setAnimalObject] = useState({
    id: null,
    age: '',
    color: '',
    location: '',
    last_seen: '',
    size: 'small',
    status: 'lost',
    description: '',
  });

  const { data, loading, error } = useQuery(FETCH_ANIMAL, {
    skip: !id,
    variables: { id: id },
    fetchPolicy: "network-only",
  });

  const [ create ] = useMutation(CREATE_ANIMAL);
  const [ update ] = useMutation(UPDATE_ANIMAL);

  useEffect(() => {
    if (data) {
      const { animal } = data;

      console.log(animal);

      setAnimalObject(animal);
    }
  }, [data]);

  if (loading) {
    return loadingView();
  }

  if (error) {
    toast('Não foi possível buscar as informações do pet');
  }

  const handleOnChange = (key, value) => {
    setAnimalObject({
      ...animalObject,
      [key]: value
    });
  }

  const handleOnSubmit = (e) => {
    e.preventDefault();
    id ? updateAnimal() : createAnimal();
  };

  const createAnimal = async() => {
    try {
      const { data } = await create({
        variables: {
          userId: user.id,
          size: animalObject.size,
          color: animalObject.color,
          status: animalObject.status,
          location: animalObject.location,
          age: parseFloat(animalObject.age),
          description: animalObject.description,
          last_seen: moment(animalObject.last_seen).format('YYYY-MM-DD'),
        },
      });

      toast("Pet cadastrado com sucesso!");
      history.push("/my_pets");
    } catch (e) {
      toast("Não foi possível cadastrar o pet");
    }
  };

  const updateAnimal = async() => {
    try {
      const { data } = await update({
        variables: {
          id: animalObject.id,
          size: animalObject.size,
          color: animalObject.color,
          status: animalObject.status,
          location: animalObject.location,
          age: parseFloat(animalObject.age),
          description: animalObject.description,
          last_seen: moment(animalObject.last_seen).format("YYYY-MM-DD"),
        },
      });

      toast("Pet atualizado com sucesso!");
      history.push("/my_pets");
    } catch (e) {
      toast("Não foi possível atualizar o pet");
    }
  };

  return (
    <div className="animated fadeIn">
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader className="font-weight-bold">
              { id ? "Editar pet" : "Novo pet" }
            </CardHeader>
            <CardBody>
              <Row className="d-flex flex-column flex-sm-row px-3 px-sm-4">
                <div className="col-12 col-sm-4 px-0 pr-sm-3">
                  <Image className="card-img" image={image} />
                  <Button className="ml-auto font-weight-bold text-white mt-2 w-100" color="secondary" type="submit">Alterar</Button>
                  <Button className="ml-auto font-weight-bold text-white mt-2 w-100" color="danger" type="submit">Remover</Button>
                </div>
                <div className="col-12 col-sm-8 px-0 pt-3 pt-sm-0 pl-sm-3 d-flex flex-column space-between">
                  <div className="form-group">
                    <Label>Cor</Label>
                    <Input value={animalObject.color} onChange={(e) => handleOnChange("color", e.target.value)} className="form-control" type="text"></Input>
                  </div>
                  <div className="form-group">
                    <DateField value={animalObject.last_seen} onChange={(e) => handleOnChange("last_seen", e)} label={"Última vez visto"} className="form-control" type="text"></DateField>
                  </div>
                  <div className="form-group">
                    <Label>Descrição</Label>
                    <Input value={animalObject.description} onChange={(e) => handleOnChange("description", e.target.value)} className="form-control" type="text"></Input>
                  </div>
                  <div className={"form-group"}>
                    <Label>Tamanho</Label>
                    <Select value={animalObject.size} onChange={(e) => handleOnChange("size", e)} className={"form-control"} options={[{ label: 'Pequeno', value: 'small' }, { label: 'Médio', value: 'medium' }, { label: 'Grande', value: 'big' }]}></Select>
                  </div>
                  <div className="form-group">
                    <Label>Localização</Label>
                    <Input value={animalObject.location} onChange={(e) => handleOnChange("location", e.target.value)} className="form-control" type="text"></Input>
                  </div>
                  <div className={"form-group"}>
                    <Label>Situação</Label>
                    <Select value={animalObject.status} onChange={(e) => handleOnChange("status", e)} className={"form-control"} className={"form-control"} options={[{ label: 'Perdido', value: 'lost' }, { label: 'Encontrado', value: 'found' }, { label: 'Para adoção', value: 'forAdoption' }, { label: 'Adotado', value: 'adopted' }]}></Select>
                  </div>
                  <div className="form-group">
                    <label>Idade</label>
                    <Input value={animalObject.age} onChange={(e) => handleOnChange("age", e.target.value)} className="form-control" type="text"></Input>
                  </div>
                  <Col lg="3" md="4" sm="12" className="d-flex pr-0 pl-0 ml-auto">
                    <Button onClick={handleOnSubmit} className="ml-auto font-weight-bold text-white mt-md-5 mt-2 w-100" color="primary" type="submit" disabled={isLoading}>{isLoading ? <Spinner size="sm" /> : 'Salvar'}</Button>
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
