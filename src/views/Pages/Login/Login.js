import React, { useState, useEffect, useContext, useParams } from 'react';
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
import { socialLogin } from '../../../services/http';
import { SessionContext } from '../../../context/SessionContext';
import authManager from '../../../services/auth';
import useToast from '../../../hooks/useToast';
import { validateEmail } from '../../../utils/validations';
import { API_BASE_URL } from '../../../endpoints';
import SocialLink from '../../../components/SocialLink';

import './Login.scss';
import logo from '../../../assets/img/pet_logo1.svg';

const LOGIN = gql`
  mutation login($identifier: String!, $password: String!) {
    login(input: { identifier: $identifier, password: $password }) {
      jwt
    }
  }
`;

const Login = (props) => {
  const history = useHistory();
  const { startSession } = useContext(SessionContext);
  const toast = useToast();
  const {
    match: {
      params: { provider },
    },
    location: { search },
  } = props;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', auth: '' });

  const [login] = useMutation(LOGIN);

  const handleSuccess = (data) => {
    const { jwt: token } = data;
    authManager.set(token);
    const decoded = jwt.decode(token);
    startSession(decoded);
    toast('Login efetuado com sucesso');
    const urlCallback = localStorage.getItem('url-callback');
    if (urlCallback) {
      localStorage.removeItem('url-callback');
      history.push(urlCallback);
    } else {
      history.push('/');
    }
  };
  const handleError = (isSocialLogin) => {
    if (isSocialLogin) {
      history.push('/login');
    }
    setErrors({ ...errors, auth: 'Ocorreu uma falha na sua autenticação' });
  };

  useEffect(() => {
    if (authManager.get()) {
      history.push('/');
    }
    if (provider && search) {
      const requestURL = `${API_BASE_URL}/auth/${provider}/callback${search}`;
      socialLogin(requestURL, handleSuccess, handleError);
    }
  }, [history]);
  const handleRegister = async (e) => {
    history.push('/register');
  };
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    try {
      const { data } = await login({
        variables: { identifier: email, password },
      });

      handleSuccess(data.login);
    } catch {
      handleError(false);
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

  const handleForgotPassword = () => {
    history.push('/forget-password');
  };
  const providers = ['facebook'];
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
                    <h2 className="text-center pb-1">
                      Bem-vindo ao S.O.S. - PET! <br />
                    </h2>
                    <h4 className="font-weight-normal text-center mb-1">
                      Perdeu seu amigo,{' '}
                      <span className="text-primary text-center pb-3 font-weight-bold">
                        podemos te ajudar
                      </span>{' '}
                    </h4>
                    <h4 className="font-weight-normal text-center mb-1">
                      Encontrou um pet perdido,{' '}
                      <span className="text-primary text-center pb-3 font-weight-bold">
                        nos informe{' '}
                      </span>{' '}
                    </h4>
                    <h4 className="font-weight-normal text-center mb-3">
                      Faça a diferença na vida de um pet,{' '}
                      <span className="text-primary text-center pb-3 font-weight-bold">
                        adote
                      </span>
                    </h4>
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
                      <div
                        className="text-muted cursor-pointer"
                        onClick={handleForgotPassword}
                      >
                        Esqueci minha senha
                      </div>
                    </FormGroup>
                    <Button
                      onClick={handleLogin}
                      color="primary"
                      className="px-4 w-100 text-white font-weight-bold text-uppercase"
                      type="submit"
                    >
                      Login
                    </Button>
                    <div className="d-flex mt-2 ">
                      <Button
                        onClick={handleRegister}
                        color="info"
                        className="px-4 w-50 mr-2 text-white font-weight-bold text-uppercase"
                        type="submit"
                      >
                        Cadastre-se
                      </Button>
                      <SocialLink
                        className="px-4 w-50"
                        provider="facebook"
                        key="facebook"
                      />
                    </div>
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
