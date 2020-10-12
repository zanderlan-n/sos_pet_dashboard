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
import SwitchInput from '../../components/Switch';

const UPDATE_USER = gql`
  mutation setMentorProfile($id: String!, $profile: SetMentorProfile!) {
    setMentorProfile(id: $id, profile: $profile) {
      name
      isMentor
      isVerified
      isFeatured
      slug
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

const CHECK_SLUG = gql`
  mutation checkSlug($slug: String!) {
    checkSlug(slug: $slug) {
      success
      error
    }
  }
`;

const validationSchema = yup.object().shape({
  name: yup.string('O nome deve ser texto').required('O nome é obrigatório'),
  slug: yup
    .string('A slug deve ser texto')
    .matches(/^[a-zA-Z0-9-]*$/, 'A slug não pode conter caracteres especiais')
    .nullable(),
});

const UserDetails = ({ user, refetch, loadingUser }) => {
  const [isConfirmingDeletion, setIsConfirmingDeletion] = useState(false);
  const [isConfirmingPasswordForgot, setIsConfirmingPasswordForgot] = useState(
    false
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [userInput, setUserInput] = useState({});
  const [validSlug, setValidSlug] = useState('');

  const toast = useToast();
  const history = useHistory();

  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);
  const [recoverPassword] = useMutation(FORGET_PASSWORD);
  const [validateSlug] = useMutation(CHECK_SLUG);

  useEffect(() => {
    if (_.isEmpty(userInput) && user) {
      setUserInput({
        ...user?.profile,
        ...user,
      });
    }
  }, [user, userInput]);

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
      const { data } = await deleteUser({ variables: { id: user.id } });

      if (!data?.deleteUser?.success) {
        throw new Error();
      }

      toast('Usuário deletado com sucesso!');
      history.push('/users');
      setUserInput({ ...userInput, isDeleted: true });
    } catch (err) {
      setErrors({ ...errors, save: 'O usuário não pôde ser deletado' });
    }
  };

  const handleForgotPassword = () => {
    if (!isConfirmingPasswordForgot) {
      setIsConfirmingPasswordForgot(true);
      setTimeout(() => setIsConfirmingPasswordForgot(false), 4000);
    } else {
      doResetPassword();
    }
  };

  const doResetPassword = async () => {
    setIsConfirmingPasswordForgot(false);

    try {
      const { data } = await recoverPassword({
        variables: {
          email: user.email,
          origin: process.env.REACT_APP_FRONTEND_URL,
        },
      });

      if (!data?.forgetPassword.success) {
        throw new Error();
      }

      toast('Email enviado com sucesso!');
    } catch {
      setErrors({
        ...errors,
        save: 'O email de recuperação de senha não pôde ser enviado',
      });
    }
  };

  const handleUserChange = (field, value) => {
    if (!user.isDeleted) {
      setUserInput({
        ...userInput,
        [field]: value,
      });
    }
  };

  const validateFields = async () => {
    setErrors({});
    setValidSlug('');
    try {
      await validationSchema.validate(userInput, {
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

  const checkSlug = async () => {
    if (loading) return;
    setLoading(true);
    const { slug } = userInput;

    if (!slug || slug.toLowerCase() === user?.profile?.slug) {
      setValidSlug('');
      setErrors({ ...errors, slug: '' });
      setLoading(false);
      return;
    }

    const { data } = await validateSlug({ variables: { slug } });

    if (!data?.checkSlug?.success && slug !== user.profile.slug) {
      setValidSlug('');
      setErrors({ ...errors, slug: data?.checkSlug?.error });
      setLoading(false);
      return;
    }

    setValidSlug('Essa slug está disponivel');
    setErrors({ ...errors, slug: '' });
    setLoading(false);
  };

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);
    const checkValidation = await validateFields();
    if (!checkValidation) {
      setLoading(false);
      return;
    }

    try {
      const { slug, name, isMentor, isVerified, isFeatured } = userInput;

      const updateSlug = slug === '' ? null : slug;

      const profile = {
        ...(updateSlug !== user.profile.slug && { slug: updateSlug }),
        ...(name !== user.profile.name && { name }),
        ...(isMentor !== user.profile.isMentor && { isMentor }),
        ...(isVerified !== user.profile.isVerified && {
          isVerified,
        }),
        ...(isFeatured !== user.profile.isFeatured && {
          isFeatured,
        }),
      };

      if (typeof profile.isMentor === 'boolean' && !profile.isMentor) {
        profile.isVerified = false;
        profile.isFeatured = false;
      }

      if (_.isEmpty(profile)) {
        setLoading(false);
        return;
      }

      const { data } = await updateUser({
        variables: {
          id: user.id,
          profile,
        },
      });

      if (data?.errors) {
        throw new Error();
      }

      setUserInput({ ...userInput, ...data.setMentorProfile });
      setValidSlug('');
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
        <Label className="font-weight-bold" htmlFor="user-id">
          ID
        </Label>
        <Input
          type="text"
          id="user-id"
          value={user.id || ''}
          spellCheck={false}
          readOnly
        />
      </FormGroup>

      <FormGroup>
        <Label className="font-weight-bold" htmlFor="name">
          Nome
        </Label>
        <Input
          type="text"
          id="name"
          value={userInput.name || ''}
          onChange={(e) => handleUserChange('name', e.target.value)}
          spellCheck={false}
          invalid={errors?.name}
          readOnly={user.isDeleted || isLoading}
        />
        <FormFeedback>{errors?.name}</FormFeedback>
      </FormGroup>

      <FormGroup>
        <Label className="font-weight-bold" htmlFor="email">
          E-mail
        </Label>
        <Input
          type="text"
          id="email"
          spellCheck={false}
          value={userInput?.email || ''}
          readOnly
        />
      </FormGroup>

      <FormGroup className="d-flex align-items-center">
        <SwitchInput
          id="isMentor"
          key="isMentor"
          value={userInput.isMentor}
          onClick={(e) => handleUserChange('isMentor', e.target.checked)}
          readOnly={user.isDeleted || isLoading}
        />
        <Label className="font-weight-bold" htmlFor="isMentor">
          Brainer
        </Label>
      </FormGroup>

      {userInput.isMentor && (
        <>
          <FormGroup className="d-flex align-items-center">
            <SwitchInput
              id="isFeatured"
              value={userInput?.isFeatured}
              onClick={(e) => handleUserChange('isFeatured', e.target.checked)}
              readOnly={user.isDeleted || isLoading}
            />
            <Label className="font-weight-bold" htmlFor="isFeatured">
              Destacado
            </Label>
          </FormGroup>

          <FormGroup className="d-flex align-items-center">
            <SwitchInput
              id="isVerified"
              value={userInput?.isVerified}
              onClick={(e) => handleUserChange('isVerified', e.target.checked)}
              readOnly={user.isDeleted || isLoading}
            />
            <Label className="font-weight-bold" htmlFor="isVerified">
              Verificado
            </Label>
          </FormGroup>

          <FormGroup>
            <Label className="font-weight-bold" htmlFor="slug">
              Slug
            </Label>
            <Input
              type="text"
              id="slug"
              value={userInput?.slug || ''}
              onChange={(e) => {
                handleUserChange('slug', e.target.value);
                setValidSlug('');
                setErrors({ ...errors, slug: null });
              }}
              onBlur={() => checkSlug()}
              spellCheck={false}
              invalid={!!errors?.slug}
              valid={!!validSlug}
              readOnly={user.isDeleted || isLoading}
            />
            <FormFeedback>{errors?.slug}</FormFeedback>
            <FormFeedback valid>{validSlug}</FormFeedback>
          </FormGroup>
        </>
      )}
      {errors.save && (
        <Alert
          color="danger"
          className="m-0 p-2 mb-2 mb-md-0 w-md-auto mr-0 mr-md-2 col-12 col-md-auto"
        >
          {errors.save}
        </Alert>
      )}
      {!user.isDeleted && (
        <Row lg="2" md="4" sm="12" className="d-flex pr-0 px-3 h-100">
          <Col lg="2" md="2" sm="12" className="d-flex pr-0 pl-0">
            <Button
              className="font-weight-bold mt-5 w-100"
              color="secondary"
              onClick={handleForgotPassword}
              disabled={isLoading}
            >
              {isConfirmingPasswordForgot ? 'Confirmar' : 'Recuperar senha'}
            </Button>
          </Col>

          <Col lg="2" md="2" sm="12" className="d-flex pr-0 pl-0 ml-auto">
            <Button
              className="ml-auto font-weight-bold mt-md-5 mt-2 w-100 btn-outline-danger"
              color="outline-danger"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isConfirmingDeletion ? 'Confirmar' : 'Excluir'}
            </Button>
          </Col>
          <Col lg="2" md="2" sm="12" className="d-flex pr-0 pl-0 ml-md-2">
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
      )}
    </>
  );
};

UserDetails.propTypes = {
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
  refetch: PT.func,
  loadingUser: PT.bool,
};

UserDetails.defaultProps = {
  user: {},
  refetch: () => {},
  loadingUser: false,
};

export default UserDetails;
