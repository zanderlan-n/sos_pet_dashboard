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

import './ForgetPassword.scss';

const FORGOTPASSWORD = gql`
  mutation forgotPassword($email: String!) {
    forgotPassword(email: $email) {
      ok
    }
  }
`;

const ForgetPassword = () => {
  const history = useHistory();
  const { startSession } = useContext(SessionContext);
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({ email: '' });

  const [forgotPassword] = useMutation(FORGOTPASSWORD);

  useEffect(() => {
    if (authManager.get()) {
      history.push('/');
    }
  }, [history]);

  const handleSendEmail = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    try {
      const { data } = await forgotPassword({
        variables: { email: email },
      });

      handleSuccess();
    } catch {
      setErrors({ ...errors, auth: 'Ocorreu uma falha ao enviar o email de recuperação de senha' });
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

    setErrors(validationErrors);
    return result;
  };

  const handleEmailBlur = () => {
    if (!errors.email || email) {
      setErrors({ ...errors, email: validateEmail(email) });
    }
  };

  const handleSuccess = () => {
    toast('Email de recuperação de senha enviado com sucesso');
    history.push('/');
  };

  return (
    <div className="app flex-row align-items-center background">
      <Container>
        <Row className="justify-content-center">
          <Col md="6">
            <CardGroup>
              <Card className="p-4">
                <CardBody>
                  <Form>
                    <h1 className="text-center pb-3">Esqueci minha senha</h1>
                    <FormGroup>
                      <Label htmlFor="email">Digite seu e-mail</Label>
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

export default ForgetPassword;
