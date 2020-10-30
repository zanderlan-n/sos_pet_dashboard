import React, { useState, useEffect, useMemo } from 'react';
import * as yup from 'yup';
import PT from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
import { useHistory } from 'react-router-dom';
import gql from 'graphql-tag';
import _ from 'lodash';
import {
  Col,
  Row,
  Input,
  Button,
  FormGroup,
  Label,
  FormFeedback,
  Alert,
  Spinner,
} from 'reactstrap';

import useToast from '../../hooks/useToast';

const UPDATE_USER = gql`
  mutation updateUser($id: ID!, $name: String!, $telephone: String!) {
    updateUser(
      input: {
        where: { id: $id }
        data: { telephone: $telephone, name: $name }
      }
    ) {
      user {
        name
        telephone
      }
    }
  }
`;

const DELETE_USER = gql`
  mutation deleteUser($id: String!) {
    deleteUser(id: $id) {
      success
      error
    }
  }
`;

const FORGET_PASSWORD = gql`
  mutation forgetPassword($email: String!, $origin: String!) {
    forgetPassword(email: $email, origin: $origin) {
      success
      error
    }
  }
`;

const validationSchema = yup.object().shape({
  name: yup.string('O nome deve ser texto').required('O nome é obrigatório'),
  telephone: yup
    .number('O telefone deve conter somente números')
    .required('O telefone é obrigatório'),
});

const PetDetails = ({ user, refetch, loadingUser }) => {
  const [isConfirmingDeletion, setIsConfirmingDeletion] = useState(false);
  const [isConfirmingPasswordForgot, setIsConfirmingPasswordForgot] = useState(
    false
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [petInput, setPetInput] = useState({});

  const toast = useToast();

  const [updateUser] = useMutation(UPDATE_USER);
  const [recoverPassword] = useMutation(FORGET_PASSWORD);

  useEffect(() => {
    if (_.isEmpty(petInput) && !_.isEmpty(user)) {
      setPetInput({
        ...user,
      });
    }
  }, [user, petInput]);

  const handleForgotPassword = () => {
    // if (!isConfirmingPasswordForgot) {
    //   setIsConfirmingPasswordForgot(true);
    //   setTimeout(() => setIsConfirmingPasswordForgot(false), 4000);
    // } else {
    //   doResetPassword();
    // }
  };

  // const doResetPassword = async () => {
  //   setIsConfirmingPasswordForgot(false);

  //   try {
  //     const { data } = await recoverPassword({
  //       variables: {
  //         email: user.email,
  //         origin: process.env.REACT_APP_FRONTEND_URL,
  //       },
  //     });

  //     if (!data?.forgetPassword.success) {
  //       throw new Error();
  //     }

  //     toast('Email enviado com sucesso!');
  //   } catch {
  //     setErrors({
  //       ...errors,
  //       save: 'O email de recuperação de senha não pôde ser enviado',
  //     });
  //   }
  // };

  const handleUserChange = (field, value) => {
    setPetInput({
      ...petInput,
      [field]: value,
    });
  };

  const validateFields = async () => {
    setErrors({});
    try {
      await validationSchema.validate(petInput, {
        abortEarly: false,
      });
      setErrors({});
      return true;
    } catch (valErrors) {
      valErrors.inner.forEach((error) =>
        setErrors({ ...errors, [error.path]: error.message })
      );
      return false;
    }
  };

  const handleSave = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    const checkValidation = await validateFields();
    if (!checkValidation) {
      setLoading(false);
      return;
    }
    try {
      const { name, telephone } = petInput;
      const { data } = await updateUser({
        variables: {
          id: user.id,
          name,
          telephone,
        },
      });
      if (data?.errors) {
        throw new Error();
      }

      setPetInput({ ...petInput, ...data.updateUser.user });
      await refetch();
      toast('Perfil alterado com sucesso');
      setLoading(false);
    } catch {
      setLoading(false);
      setErrors({ ...errors, save: 'Ocorreu uma falha na edição do cadastro' });
    }
  };

  const isLoading = useMemo(() => loading || loadingUser, [
    loading,
    loadingUser,
  ]);

  return (
    <>
      <FormGroup>
        <Label className="font-weight-bold" htmlFor="description">
          Descrição
        </Label>
        <Input
          type="text"
          id="description"
          value={petInput.description || ''}
          onChange={(e) => handleUserChange('description', e.target.value)}
          spellCheck={false}
          invalid={errors?.description}
          readOnly={isLoading}
        />
        <FormFeedback>{errors?.description}</FormFeedback>
      </FormGroup>
      <FormGroup>
        <Label className="font-weight-bold" htmlFor="description">
          Cor
        </Label>
        <Input
          type="text"
          id="color"
          value={petInput.color || ''}
          onChange={(e) => handleUserChange('color', e.target.value)}
          spellCheck={false}
          invalid={errors?.color}
          readOnly={isLoading}
        />
        <FormFeedback>{errors?.color}</FormFeedback>
      </FormGroup>
      <FormGroup>
        <Label className="font-weight-bold" htmlFor="description">
          Última vez visto
        </Label>
        <Input
          type="text"
          id="last_seen"
          value={petInput.last_seen || ''}
          onChange={(e) => handleUserChange('last_seen', e.target.value)}
          spellCheck={false}
          invalid={errors?.last_seen}
          readOnly={isLoading}
        />
        <FormFeedback>{errors?.last_seen}</FormFeedback>
      </FormGroup>
      {errors.save && (
        <Alert
          color="danger"
          className="m-0 p-2 mb-2 mb-md-0 w-md-auto mr-0 mr-md-2 col-12 col-md-auto"
        >
          {errors.save}
        </Alert>
      )}
      <Row lg="2" md="4" sm="12" className="d-flex pr-0 px-3 h-100">
        <Col lg="2" md="2" sm="12" className="d-flex pr-0 pl-0 ml-auto ">
          <Button
            className="ml-auto font-weight-bold text-white mt-md-5 mt-2 w-100"
            color="primary"
            onClick={handleSave}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="sm" /> : 'Salvar'}
          </Button>
        </Col>
      </Row>
    </>
  );
};

PetDetails.propTypes = {
  user: PT.shape({
    email: PT.string,
    id: PT.string,
    name: PT.string,
    telephone: PT.string,
  }),
  refetch: PT.func,
  loadingUser: PT.bool,
};

PetDetails.defaultProps = {
  user: {},
  refetch: () => {},
  loadingUser: false,
};

export default PetDetails;
