import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useHistory } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  CardGroup,
  Col,
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  FormFeedback,
  Alert,
} from 'reactstrap';
import InputMask from 'react-input-mask';
import { getOnlyNumbers } from '../../../utils/parsers';

import authManager from '../../../services/auth';
import useToast from '../../../hooks/useToast';
import { validateEmail } from '../../../utils/validations';

import './Register.scss';

const REGISTER = gql`
  mutation createUser(
    $email: String!
    $password: String!
    $telephone: String!
    $name: String!
  ) {
    createUser(
      input: {
        data: {
          email: $email
          username: $email
          password: $password
          telephone: $telephone
          name: $name
        }
      }
    ) {
      user {
        id
      }
    }
  }
`;

const Register = () => {
  const history = useHistory();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    auth: '',
    name: '',
    telephone: '',
  });

  const [register] = useMutation(REGISTER);

  useEffect(() => {
    if (authManager.get()) {
      history.push('/');
    }
  }, [history]);
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;
    const clearPhone = getOnlyNumbers(telephone);

    try {
      await register({
        variables: { email, password, name, telephone: clearPhone },
      });
      handleSuccess();
    } catch {
      setErrors({ ...errors, auth: 'Ocorreu uma falha na sua autenticação' });
    }
  };
  const handleSuccess = () => {
    toast('Cadastro efetuado com sucesso');
    history.push('/login');
  };
  const validateFields = () => {
    let result = true;
    const validationErrors = {
      email: '',
      password: '',
      name: '',
      telephone: '',
    };

    if (!email) {
      validationErrors.email = 'O email é obrigatório';
      result = false;
    } else {
      const emailValidation = validateEmail(email);
      if (emailValidation) {
        validationErrors.email = 'E-mail inválido';
        result = false;
      }
    }

    if (!password) {
      validationErrors.password = 'A senha é obrigatória';
      result = false;
    }
    if (!name) {
      validationErrors.name = 'O nome é obrigatorio';
      result = false;
    }
    if (!telephone) {
      validationErrors.telephone = 'O telefone é obrigatorio';
      result = false;
    }

    setErrors(validationErrors);
    return result;
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);

    if (password && errors.password) {
      setErrors({ ...errors, password: '' });
    }
  };

  const handleEmailBlur = () => {
    if (!errors.email || email) {
      setErrors({ ...errors, email: validateEmail(email) });
    }
  };

  return (
    <div className="app flex-row align-items-center background">
      <Container>
        <Row className="justify-content-center">
          <Col md="6" className="px-1">
            <CardGroup>
              <Card className="p-4">
                <CardBody>
                  <Form>
                    <h1 className="text-center pb-3">Cadastre-se</h1>
                    <FormGroup>
                      <Label htmlFor="email">Nome</Label>
                      <Input
                        id="nome"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        invalid={errors.name}
                      />
                      <FormFeedback invalid>{errors.name}</FormFeedback>
                    </FormGroup>
                    <FormGroup>
                      <Label htmlFor="tel">Telefone</Label>
                      <Input
                        tag={InputMask}
                        mask="(99) 99999-9999"
                        id="telefone"
                        type="tel"
                        autoComplete="tel"
                        value={telephone}
                        // onBlur={handleEmailBlur}
                        onChange={(e) => setTelephone(e.target.value)}
                        invalid={errors.telephone}
                      />
                      <FormFeedback invalid>{errors.telephone}</FormFeedback>
                    </FormGroup>
                    <FormGroup>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="text"
                        autoComplete="email"
                        value={email}
                        onBlur={handleEmailBlur}
                        onChange={(e) => setEmail(e.target.value)}
                        invalid={errors.email}
                      />
                      <FormFeedback invalid>{errors.email}</FormFeedback>
                    </FormGroup>
                    <FormGroup className="mb-4">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={handlePasswordChange}
                        invalid={errors.password}
                      />
                      <FormFeedback invalid>{errors.password}</FormFeedback>
                    </FormGroup>
                    <Button
                      onClick={handleRegister}
                      color="primary"
                      className="px-4 w-100 text-white font-weight-bold text-uppercase"
                      type="submit"
                    >
                      Criar minha conta
                    </Button>
                    {errors.auth && (
                      <Alert color="danger" className="mt-2">
                        {errors.auth}
                      </Alert>
                    )}
                  </Form>
                </CardBody>
              </Card>
            </CardGroup>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;
