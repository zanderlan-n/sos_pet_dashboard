import React, { useState, useEffect, useContext } from 'react';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useHistory, useParams } from 'react-router-dom';
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

import './RecoverPassword.scss';

const RECOVERPASSWORD = gql`
  mutation resetPassword($password: String!, $passwordConfirmation: String!, $code: String!) {
    resetPassword(password: $password, passwordConfirmation: $passwordConfirmation, code: $code) {
      jwt
    }
  }
`;

const RecoverPassword = ({match}) => {
  const code = match.params.token;
  const history = useHistory();
  const { token: recoverEmailToken } = useParams();
  const { startSession } = useContext(SessionContext);
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ password: '' });

  const [recoverPassword] = useMutation(RECOVERPASSWORD);

  useEffect(() => {
    if (authManager.get()) {
      history.push('/');
    }
  }, [history]);

  const handleSendEmail = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    try {
      const { data } = await recoverPassword({
        variables: { password: password, passwordConfirmation: password, code: code },
      });

      handleSuccess();
    } catch(e) {
      console.error(e);
      setErrors({ ...errors, auth: 'Ocorreu uma falha na alteração da senha' });
    }
  };

  const validateFields = () => {
    let result = true;
    const validationErrors = {
      email: '',
      password: '',
    };

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

  const handleSuccess = () => {
    toast('Senha alterada com sucesso!');
    history.push('/');
  };

  if (!recoverEmailToken) {
    history.push('/');
  }
  return (
    <div className="app flex-row align-items-center background">
      <Container>
        <Row className="justify-content-center">
          <Col md="6">
            <CardGroup>
              <Card className="p-4">
                <CardBody>
                  <Form>
                    <h1 className="text-center pb-3">Alterar minha senha</h1>
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
                      onClick={handleSendEmail}
                      color="primary"
                      className="px-4 w-100 text-white font-weight-bold text-uppercase"
                      type="submit"
                    >
                      Enviar
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

export default RecoverPassword;
