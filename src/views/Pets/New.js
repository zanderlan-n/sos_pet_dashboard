import React, { useEffect, useState } from 'react';

import { useParams, useHistory } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/react-hooks';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Label,
  Spinner,
  Button,
  Input,
  FormFeedback,
} from 'reactstrap';
import gql from 'graphql-tag';
import * as yup from 'yup';
import swal from 'sweetalert';
import * as moment from 'moment';
import { Select } from 'antd';

import useToast from '../../hooks/useToast';
import useSession from '../../hooks/useSession';
import { PET_STATUS } from '../../config/constants';
import loadingView from '../../components/Loading';
import DateField from '../../components/DateField';
import FileUploadButton from '../../components/FileUploadButton';
import './Pets.scss';

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
      image {
        id
        url
        name
      }
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
    $imageId: ID
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
          image: [$imageId]
        }
      }
    ) {
      animal {
        id
        user {
          id
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
    $imageId: ID
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
          image: [$imageId]
        }
      }
    ) {
      animal {
        id
      }
    }
  }
`;

const DELETE_ANIMAL = gql`
  mutation deleteAnimal($id: ID!) {
    deleteAnimal(input: { where: { id: $id } }) {
      animal {
        id
      }
    }
  }
`;

const validationSchema = yup.object().shape({
  color: yup
    .string('A cor deve ser texto')
    .max(20, 'O nome deve ter no máximo 20 caracteres')
    .required('A cor é obrigatória'),
  last_seen: yup
    .date('A última vez vista deve ser data')
    .required('A última vez vista é obrigatória'),
  description: yup
    .string('A descrição deve ser texto')
    .max(200, 'A descrição deve ter no máximo 200 caracteres')
    .required('A descrição é obrigatória'),
  size: yup
    .string('O tamanho deve ser texto')
    .required('O tamanho é obrigatório'),
  location: yup
    .string('A localização deve ser texto')
    .max(200, 'A localização deve ter no máximo 200 caracteres')
    .required('A localização é obrigatória'),
  status: yup
    .string('A situação deve ser texto')
    .required('A situação é obrigatória'),
  age: yup
    .string('A idade deve ser string')
    .max(3, 'A localização deve ter no máximo 3 caracteres')
    .required('A idade é obrigatória'),
});

let isLoading = false;
let isDeleteLoading = false;

let isSubmittedPet = false;

const Pet = () => {
  const { id } = useParams();
  const toast = useToast();

  const { user } = useSession();

  const history = useHistory();

  const [errors, setErrors] = useState({});
  const [imageLoading, setImageLoading] = useState(false);
  const [animalObject, setAnimalObject] = useState({
    id: null,
    age: '',
    color: '',
    location: '',
    size: 'small',
    imageId: null,
    status: 'lost',
    description: '',
    last_seen: new Date(),
  });

  const { data, loading, error } = useQuery(FETCH_ANIMAL, {
    skip: !id,
    variables: { id: id },
    fetchPolicy: 'network-only',
  });

  const [create] = useMutation(CREATE_ANIMAL);
  const [update] = useMutation(UPDATE_ANIMAL);
  const [remove] = useMutation(DELETE_ANIMAL);

  useEffect(() => {
    if (data) {
      const { animal } = data;

      animal.age = animal.age.toString();
      animal.imageUrl = animal.image.url;
      animal.last_seen = new Date(animal.last_seen);

      if (
        animal &&
        animal.image &&
        animal.image.length &&
        animal.image.length > 0
      ) {
        animal.imageId = animal.image[0].id;
        animal.imageUrl = animal.image[0].url;
      }

      setAnimalObject(animal);
    }
  }, [data]);

  const validateFields = async () => {
    try {
      await validationSchema.validate(animalObject, {
        abortEarly: false,
        strict: true,
      });
      setErrors({});
      return true;
    } catch (valErrors) {
      const newErrors = valErrors.inner.reduce((obj, { message, path }) => {
        obj[path] = message;
        return obj;
      }, {});

      setErrors(newErrors);
      return false;
    }
  };

  useEffect(() => {
    if (!id && isSubmittedPet) {
      validateFields().then();
    }

    if (id) {
      validateFields().then();
    }
  }, [animalObject]);

  const handleOnChange = (key, value) => {
    setAnimalObject({
      ...animalObject,
      [key]: value,
    });
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();

    isSubmittedPet = true;

    validateFields().then((validation) => {
      if (!validation) return;
      id ? updateAnimal() : createAnimal();
    });
  };

  const handleOnDelete = (e) => {
    e.preventDefault();
    deleteAnimal();
  };

  const createAnimal = async () => {
    isLoading = true;

    try {
      const { data } = await create({
        variables: {
          userId: user.id,
          size: animalObject.size,
          color: animalObject.color,
          status: animalObject.status,
          imageId: animalObject.imageId,
          location: animalObject.location,
          age: parseFloat(animalObject.age),
          description: animalObject.description,
          last_seen: moment(animalObject.last_seen).format('YYYY-MM-DD'),
        },
      });

      isLoading = false;
      toast('Pet cadastrado com sucesso!');
      history.push('/my_pets');
    } catch (err) {
      isLoading = false;

      const msg =
        err?.message?.search('GraphQL error: ') > -1
          ? err?.message?.replace('GraphQL error: ', '')
          : 'Ocorreu uma falha ao realizar o cadastro';

      setErrors({
        ...errors,
        save: msg,
      });
    }
  };

  const updateAnimal = async () => {
    isLoading = true;

    try {
      const { data } = await update({
        variables: {
          id: animalObject.id,
          size: animalObject.size,
          color: animalObject.color,
          status: animalObject.status,
          imageId: animalObject.imageId,
          location: animalObject.location,
          age: parseFloat(animalObject.age),
          description: animalObject.description,
          last_seen: moment(animalObject.last_seen).format('YYYY-MM-DD'),
        },
      });

      isLoading = false;
      toast('Pet atualizado com sucesso!');
      history.push('/my_pets');
    } catch (err) {
      isLoading = false;

      const msg =
        err?.message?.search('GraphQL error: ') > -1
          ? err?.message?.replace('GraphQL error: ', '')
          : 'Ocorreu uma falha ao realizar a atualização';

      setErrors({
        ...errors,
        save: msg,
      });

      console.error(error);
    }
  };

  const deleteAnimal = () => {
    swal({
      title: 'Deseja excluir este pet?',
      text: 'A exclusão não pode ser desfeita',
      icon: 'warning',
      buttons: {
        cancel: 'Não',
        confirm: 'Sim',
      },
      dangerMode: true,
    }).then(async (willDelete) => {
      if (!willDelete) {
        return;
      }

      isDeleteLoading = true;

      try {
        const { data } = await remove({
          variables: {
            id: animalObject.id,
          },
        });

        isDeleteLoading = false;
        toast('Pet excluído com sucesso!');
        history.push('/my_pets');
      } catch (err) {
        isDeleteLoading = false;
        toast('Ocorreu uma falha ao realizar a exclusão');
      }
    });
  };

  const onImageSuccess = (e) => {
    setAnimalObject({
      ...animalObject,
      imageId: e.id,
    });
  };

  const onImageFailure = (e) => {
    toast('Não foi possível salvar a imagem');
  };

  if (loading) {
    return loadingView();
  }

  if (error) {
    toast('Não foi possível buscar as informações do pet');
  }
  return (
    <div className="animated fadeIn">
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader className="font-weight-bold">
              {id ? 'Editar pet' : 'Novo pet'}
            </CardHeader>
            <CardBody>
              <Row className="d-flex flex-column flex-sm-row px-3 px-sm-4">
                <div className="col-12 col-sm-4 px-0 pr-sm-3">
                  <FileUploadButton
                    defaultImageType={'PET'}
                    url={animalObject.imageUrl}
                    onSuccess={onImageSuccess}
                    onFailure={onImageFailure}
                    size={'100%'}
                    setLoading={setImageLoading}
                    loading={imageLoading}
                  />
                </div>
                <div className="col-12 col-sm-8 px-0 pt-3 pt-sm-0 pl-sm-3 d-flex flex-column space-between">
                  <div className={'form-group'}>
                    <Label>Situação</Label>
                    <Select
                      style={{ padding: 0 }}
                      id={'status'}
                      value={animalObject.status}
                      onChange={(e) => handleOnChange('status', e)}
                      className="form-control"
                      options={[
                        { label: 'Perdido', value: 'lost' },
                        { label: 'Encontrado', value: 'found' },
                        { label: 'Para adoção', value: 'forAdoption' },
                        // { label: 'Adotado', value: 'adopted' },
                      ]}
                    />
                    <FormFeedback>{errors?.status}</FormFeedback>
                  </div>
                  <div className="form-group">
                    <Label>Cor</Label>
                    <Input
                      id={'color'}
                      value={animalObject.color}
                      onChange={(e) => handleOnChange('color', e.target.value)}
                      spellCheck={false}
                      invalid={!!errors?.color}
                      className="form-control"
                      type="text"
                    />
                    <FormFeedback>{errors?.color}</FormFeedback>
                  </div>
                  {animalObject.status === PET_STATUS.LOST && (
                    <div className="form-group">
                      <DateField
                        id="last_seen"
                        value={animalObject.last_seen}
                        onChange={(e) => handleOnChange('last_seen', e)}
                        label="Última vez visto"
                        invalid={!!errors?.last_seen}
                        error={errors?.last_seen}
                        className="form-control"
                        type="text"
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <Label>Descrição</Label>
                    <Input
                      type="textarea"
                      row={2}
                      id={'description'}
                      value={animalObject.description}
                      onChange={(e) =>
                        handleOnChange('description', e.target.value)
                      }
                      spellCheck={false}
                      invalid={!!errors?.description}
                      className="form-control"
                    />
                    <FormFeedback>{errors?.description}</FormFeedback>
                  </div>
                  <div className={'form-group'}>
                    <Label>Tamanho</Label>
                    <Select
                      id="size"
                      style={{ padding: 0 }}
                      value={animalObject.size}
                      onChange={(e) => handleOnChange('size', e)}
                      className="form-control"
                      options={[
                        { label: 'Pequeno', value: 'small' },
                        { label: 'Médio', value: 'medium' },
                        { label: 'Grande', value: 'big' },
                      ]}
                    />
                    <FormFeedback>{errors?.size}</FormFeedback>
                  </div>
                  <div className="form-group">
                    <Label>Localização</Label>
                    <Input
                      id="location"
                      value={animalObject.location}
                      onChange={(e) =>
                        handleOnChange('location', e.target.value)
                      }
                      spellCheck={false}
                      invalid={!!errors?.location}
                      className="form-control"
                      type="text"
                    />
                    <FormFeedback>{errors?.location}</FormFeedback>
                  </div>
                  <div className="form-group">
                    <label>Idade</label>
                    <Input
                      id="age"
                      value={animalObject.age}
                      onChange={(e) => handleOnChange('age', e.target.value)}
                      spellCheck={false}
                      className="form-control"
                      type="text"
                    />
                  </div>
                  <Col
                    lg="3"
                    md="4"
                    sm="12"
                    className="d-flex pr-0 pl-0 ml-auto"
                  >
                    {id ? (
                      <Button
                        onClick={handleOnDelete}
                        style={{ marginRight: '10px' }}
                        className="ml-auto font-weight-bold text-white mt-md-5 mt-2 w-100"
                        color="danger"
                        type="button"
                        disabled={isDeleteLoading || imageLoading || isLoading}
                      >
                        {isDeleteLoading || imageLoading || isLoading ? (
                          <Spinner size="sm" />
                        ) : (
                          'Excluir'
                        )}
                      </Button>
                    ) : (
                      ''
                    )}
                    <Button
                      onClick={handleOnSubmit}
                      className="ml-auto font-weight-bold text-white mt-md-5 mt-2 w-100"
                      color="primary"
                      type="submit"
                      style={{ maxHeight: '40px' }}
                      disabled={isLoading || imageLoading}
                    >
                      {isLoading || imageLoading ? (
                        <Spinner size="sm" />
                      ) : (
                        'Salvar'
                      )}
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
