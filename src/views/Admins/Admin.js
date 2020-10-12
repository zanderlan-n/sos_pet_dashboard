import React, { useState, useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useParams, useHistory } from 'react-router-dom';
import * as yup from 'yup';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Button,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Alert,
} from 'reactstrap';

import {
  validateFields,
  defaultValidations,
  defaultErrorMessages,
} from '../../utils/validations';
import useToast from '../../hooks/useToast';
import useSession from '../../hooks/useSession';

import './Admin.scss';

const FETCH_ADMIN = gql`
  query userAdmin($id: String!) {
    userAdmin(id: $id) {
      id
      name
      email
      isAdmin
      isDeleted
    }
  }
`;

const DELETE_ADMIN = gql`
  mutation deleteUserAdmin($id: String!) {
    deleteUserAdmin(id: $id) {
      success
      error
    }
  }
`;

const CREATE_ADMIN = gql`
  mutation createUserAdmin(
    $name: String!
    $email: String!
    $password: String!
    $isAdmin: Boolean!
  ) {
    createUserAdmin(
      userAdmin: {
        name: $name
        email: $email
        password: $password
        isAdmin: $isAdmin
      }
    ) {
      success
      error
    }
  }
`;

const UPDATE_ADMIN = gql`
  mutation setUserAdmin($userAdmin: UserAdminUpdateInput!) {
    setUserAdmin(userAdmin: $userAdmin) {
      success
      error
    }
  }
`;

const updateSchema = yup.object().shape({
  name: defaultValidations.name.required(defaultErrorMessages.IS_REQUIRED),
});

const createSchema = yup.object().shape({
  name: defaultValidations.name.required(defaultErrorMessages.IS_REQUIRED),
  email: defaultValidations.email.required(defaultErrorMessages.IS_REQUIRED),
  password: defaultValidations.password.required(
    defaultErrorMessages.IS_REQUIRED
  ),
});

const Admin = () => {
  const [adminDefaultValue, setAdminDefaultValue] = useState({
    isAdmin: false,
  });
  const [admin, setAdmin] = useState({});
  const [newMode, setNewMode] = useState(false);
  const [isConfirmingDeletion, setIsConfirmingDeletion] = useState(false);
  const [errors, setErrors] = useState({});

  const { id } = useParams();
  const toast = useToast();
  const history = useHistory();
  const session = useSession();

  const [deleteUserAdmin] = useMutation(DELETE_ADMIN);
  const [createUserAdmin] = useMutation(CREATE_ADMIN);
  const [updateUserAdmin] = useMutation(UPDATE_ADMIN);
  const { data: responseData, loading, error } = useQuery(FETCH_ADMIN, {
    variables: { id },
  });

  useEffect(() => {
    if (!id) {
      setNewMode(true);
    }
  }, [id]);

  useEffect(() => {
    if (loading || !responseData?.userAdmin || error) {
      return;
    }

    setAdminDefaultValue(responseData.userAdmin);
    setAdmin(responseData.userAdmin);
  }, [responseData, loading, error]);

  const handleDelete = () => {
    if (!isConfirmingDeletion) {
      setIsConfirmingDeletion(true);
      setTimeout(() => setIsConfirmingDeletion(false), 4000);
    } else {
      doDelete();
    }
  };

  const doDelete = async () => {
    setIsConfirmingDeletion(false);

    try {
      const { data } = await deleteUserAdmin({ variables: { id } });

      if (!data?.deleteUserAdmin?.success) {
        setErrors({ ...errors, save: data.deleteUserAdmin.error });
        return;
      }

      toast('Usuário deletado com sucesso!');
      setAdmin({ ...admin, isDeleted: true });
    } catch (err) {
      setErrors({ ...errors, save: 'O usuário não pode ser deletado' });
    }
  };

  const handleAdminChange = (field, value) => {
    if (admin.isDeleted) return;

    setAdmin({
      ...admin,
      [field]: value,
    });
  };

  const handleCreate = async () => {
    if (!(await validateFields(createSchema, admin, setErrors))) return;

    try {
      const { data } = await createUserAdmin({ variables: admin });

      if (!data?.createUserAdmin?.success) {
        throw new Error(data?.createUserAdmin?.error);
      }

      handleSuccess();
    } catch {
      setErrors({ ...errors, save: 'Ocorreu uma falha no cadastro' });
    }
  };

  const handleUpdate = async () => {
    if (!(await validateFields(updateSchema, admin, setErrors))) return;

    try {
      const { name, isAdmin } = admin;

      if (
        name === adminDefaultValue.name &&
        isAdmin === adminDefaultValue.isAdmin
      ) {
        return;
      }

      const userAdmin = { id, name, isAdmin };

      const { data } = await updateUserAdmin({
        variables: { userAdmin },
      });

      if (!data?.setUserAdmin?.success) {
        throw new Error();
      }

      setAdminDefaultValue(admin);
      toast('Administrador atualizado com sucesso');
    } catch (err) {
      setErrors({ ...errors, save: 'Ocorreu uma falha ao salvar o usuário' });
    }
  };

  const handleSuccess = () => {
    toast('Administrador cadastrado com sucesso');
    history.push('/admins');
  };

  return (
    <div className="animated fadeIn">
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader className="font-weight-bold">
              {newMode && 'Novo '}Administrador
            </CardHeader>

            <CardBody>
              {!newMode && (
                <FormGroup>
                  <Label className="font-weight-bold" htmlFor="admin-id">
                    ID
                  </Label>
                  <Input
                    type="text"
                    id="admin-id"
                    value={admin.id}
                    spellCheck={false}
                    readOnly
                  />
                </FormGroup>
              )}

              <FormGroup>
                <Label className="font-weight-bold" htmlFor="name">
                  Nome{newMode && ' *'}
                </Label>
                <Input
                  type="text"
                  id="name"
                  value={admin.name}
                  onChange={(e) => handleAdminChange('name', e.target.value)}
                  spellCheck={false}
                  invalid={errors.name}
                  readOnly={admin.isDeleted}
                />
                <FormFeedback invalid>{errors.name}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label className="font-weight-bold" htmlFor="email">
                  E-mail{newMode && ' *'}
                </Label>
                <Input
                  type="text"
                  id="email"
                  value={admin.email}
                  spellCheck={false}
                  onChange={(e) => handleAdminChange('email', e.target.value)}
                  invalid={errors.email}
                  readOnly={!newMode}
                />
                <FormFeedback invalid>{errors.email}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Col className="pl-0">
                  <Label className="font-weight-bold">Permissões</Label>
                </Col>
                <FormGroup check inline>
                  <Input
                    className="form-check-input"
                    type="radio"
                    id="inline-radio1"
                    name="inline-radios"
                    checked={!admin.isAdmin}
                    onChange={() => handleAdminChange('isAdmin', false)}
                  />
                  <Label
                    className="form-check-label"
                    check
                    htmlFor="inline-radio1"
                  >
                    Gerente
                  </Label>
                </FormGroup>
                <FormGroup check inline>
                  <Input
                    className="form-check-input"
                    type="radio"
                    id="inline-radio2"
                    name="inline-radios"
                    checked={admin.isAdmin}
                    onChange={() => handleAdminChange('isAdmin', true)}
                  />
                  <Label
                    className="form-check-label"
                    check
                    htmlFor="inline-radio2"
                  >
                    Administrador
                  </Label>
                </FormGroup>
                {newMode && (
                  <FormGroup>
                    <Label className="font-weight-bold pt-3" htmlFor="password">
                      Senha *
                    </Label>
                    <Input
                      type="password"
                      id="password"
                      value={admin.password}
                      onChange={(e) =>
                        handleAdminChange('password', e.target.value)
                      }
                      invalid={errors.password}
                    />
                    <FormFeedback invalid>{errors.password}</FormFeedback>
                  </FormGroup>
                )}
              </FormGroup>

              {errors.save && (
                <Alert
                  color="danger"
                  className="m-0 p-2 mb-2 mb-md-0 w-md-auto mr-0 mr-md-2 col-12 col-md-auto"
                >
                  {errors.save}
                </Alert>
              )}
              {!admin.isDeleted && (
                <Col className="d-flex flex-column flex-md-row ml-auto align-items-center justify-content-end pr-0 pl-0 mt-5">
                  {!newMode && session?.user?.id !== id && (
                    <Button
                      className="action-button font-weight-bold col-lg-3 col-md-4 col-sm-12 p-0"
                      color="outline-danger"
                      onClick={handleDelete}
                      disabled={admin.isDeleted}
                    >
                      {isConfirmingDeletion ? 'Confirmar' : 'Excluir'}
                    </Button>
                  )}
                  <Button
                    className="action-button font-weight-bold text-white w-100 col-lg-3 col-md-4 col-sm-12 ml-2 p-0"
                    color="primary"
                    onClick={newMode ? handleCreate : handleUpdate}
                  >
                    Salvar
                  </Button>
                </Col>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Admin;
