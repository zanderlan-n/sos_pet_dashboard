import React, { useState } from 'react';
import PT from 'prop-types';
import * as yup from 'yup';
import { useMutation } from '@apollo/react-hooks';
import { useHistory } from 'react-router-dom';
import gql from 'graphql-tag';
import {
  Col,
  Input,
  Button,
  FormGroup,
  Label,
  FormFeedback,
  Alert,
} from 'reactstrap';

import { validateField } from '../../utils/validations';
import useToast from '../../hooks/useToast';

const CREATE_USER = gql`
  mutation register($registration: RegistrationInput!) {
    register(registration: $registration) {
      id
    }
  }
`;

const validationSchema = yup.object().shape({
  name: yup
    .string('O nome deve ser texto')
    .max(20, 'O nome deve ter no máximo 20 caracteres')
    .required('O nome é obrigatório'),
  email: yup
    .string('O e-mail deve ser texto')
    .email('O e-mail deve ser válido')
    .required('O e-mail é obrigatório'),
  password: yup
    .string('A senha deve ser texto')
    .min(8, 'A senha deve ter no minimo 8 caracteres')
    .matches(
      /^^(?=.*?[a-z])(?=.*?[0-9]).{0,}$/,
      'A senha deve ter pelo menos uma letra e um número'
    )
    .required('A senha é obrigatória'),
});

const NewUser = () => {
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState({});

  const toast = useToast();
  const history = useHistory();

  const [createUser] = useMutation(CREATE_USER);

  const handleUserChange = (field, value) => {
    setUser({
      ...user,
      [field]: value,
    });
  };

  const validateFields = async () => {
    try {
      await validationSchema.validate(user, {
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

  const handleSave = async () => {
    if (!(await validateFields())) return;

    try {
      const { name, email, password } = user;

      const { data } = await createUser({
        variables: {
          registration: {
            name,
            email,
            password,
            origin: window.origin,
          },
        },
      });

      if (data?.errors) {
        throw new Error(data.errors[0]);
      }

      toast('Usuário criado com sucesso!');
      history.push(`/users/${data.register.id}`);
    } catch (err) {
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

  return (
    <>
      <FormGroup>
        <Label className="font-weight-bold" htmlFor="name">
          Nome *
        </Label>
        <Input
          type="text"
          id="name"
          value={user.name || ''}
          onChange={(e) => handleUserChange('name', e.target.value)}
          onBlur={() =>
            validateField(user, 'name', validationSchema, errors, setErrors)
          }
          spellCheck={false}
          invalid={!!errors?.name}
        />
        <FormFeedback>{errors?.name}</FormFeedback>
      </FormGroup>

      <FormGroup>
        <Label className="font-weight-bold" htmlFor="email">
          E-mail *
        </Label>
        <Input
          type="email"
          id="email"
          value={user.email || ''}
          onBlur={() =>
            validateField(user, 'email', validationSchema, errors, setErrors)
          }
          onChange={(e) => handleUserChange('email', e.target.value)}
          spellCheck={false}
          invalid={!!errors.email}
        />
        <FormFeedback>{errors.email}</FormFeedback>
      </FormGroup>

      <FormGroup>
        <Label className="font-weight-bold" htmlFor="password">
          Senha *
        </Label>
        <Input
          type="password"
          id="password"
          value={user.password || ''}
          onChange={(e) => handleUserChange('password', e.target.value)}
          onBlur={() =>
            validateField(user, 'password', validationSchema, errors, setErrors)
          }
          invalid={!!errors.password}
        />
        <FormFeedback>{errors.password}</FormFeedback>
      </FormGroup>

      {errors.save && (
        <Alert
          color="danger"
          className="m-0 p-2 mb-2 mb-md-0 w-md-auto mr-0 mr-md-2 col-12 col-md-auto"
        >
          {errors.save}
        </Alert>
      )}

      <Col lg="3" md="4" sm="12" className="d-flex pr-0 pl-0 ml-auto">
        <Button
          className="ml-auto font-weight-bold text-white mt-5 w-100"
          color="primary"
          onClick={handleSave}
        >
          Salvar
        </Button>
      </Col>
    </>
  );
};

NewUser.propTypes = {
  user: PT.shape({
    id: PT.string,
    email: PT.string,
    profile: PT.shape({
      name: PT.string,
      slug: PT.string,
      isFeatured: PT.bool,
      isMentor: PT.bool,
      isVerified: PT.bool,
    }),
    isDeleted: PT.bool,
  }),
};

NewUser.defaultProps = {
  user: {},
};

export default NewUser;
