import React, { useState, useEffect, useContext } from 'react';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useHistory } from 'react-router-dom';
import jwt from 'jsonwebtoken';
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

import { SessionContext } from '../../../context/SessionContext';
import authManager from '../../../services/auth';
import useToast from '../../../hooks/useToast';
import { validateEmail } from '../../../utils/validations';

import './Login.scss';
import logo from '../../../assets/img/pet_logo.png';

const LOGIN = gql`
  mutation login($identifier: String!, $password: String!) {
    login(input: { identifier: $identifier, password: $password }) {
      jwt
    }
  }
`;

const Login = () => {
  const history = useHistory();
  const { startSession } = useContext(SessionContext);
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', auth: '' });

  const [login] = useMutation(LOGIN);

  useEffect(() => {
    if (authManager.get()) {
      history.push('/');
    }
  }, [history]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    try {
      const { data } = await login({
        variables: { identifier: email, password },
      });

      const { jwt: token } = data.login;
      authManager.set(token);
      const decoded = jwt.decode(token);

      startSession(decoded);

      handleSuccess();
    } catch {
      setErrors({ ...errors, auth: 'Ocorreu uma falha na sua autenticação' });
    }
  };

  const validateFields = () => {
    let result = true;
    const validationErrors = {
      email: '',
      password: '',
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

  const handleSuccess = () => {
    toast('Login efetuado com sucesso');
    history.push('/');
  };

  return (
    <div className="app flex-row align-items-center background">
      <Container>
        <img id="background-image" src={logo} alt="" />
        <Row className="justify-content-center">
          <Col md="6">
            <CardGroup>
              <Card className="p-4">
                <CardBody>
                  <Form>
                    <h1 className="text-center pb-3">Login</h1>
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
                      onClick={handleLogin}
                      color="primary"
                      className="px-4 w-100 text-white font-weight-bold text-uppercase"
                      type="submit"
                    >
                      Login
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

export default Login;
