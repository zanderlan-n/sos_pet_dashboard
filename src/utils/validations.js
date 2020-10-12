import * as yup from 'yup';

export const validateFields = async (schema, data, setErrors) => {
  try {
    await schema.validate(data, {
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

export const validatePassword = (password) => {
  return password.length && password.length < 6 ? 'Senhá inválida' : null;
};

export const validateName = (name) => {
  if (name.length && name.length > 20)
    return `Seu nome público deve conter no máximo 20 caracteres`;

  return null;
};

export const validateEmail = (email) => {
  const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  const emailValidator = emailRegex.test(email);
  return email && !emailValidator ? 'Email inválido' : null;
};

export const defaultErrorMessages = {
  IS_TEXT: 'Este campo deve conter somente texto',
  IS_REQUIRED: 'Este campo é obrigatório',
  IS_EMAIL: 'Este campo deve ser um email válido',
};

export const defaultValidations = {
  name: yup
    .string(defaultErrorMessages.IS_TEXT)
    .max(50, 'O nome deve ter no máximo 50 caracteres'),
  email: yup
    .string(defaultErrorMessages.IS_TEXT)
    .email(defaultErrorMessages.IS_EMAIL),
  password: yup
    .string(defaultErrorMessages.IS_TEXT)
    .min(6, 'Este campo deve ter no mínimo 6 caracteres'),
};

export const validateField = async (
  input,
  field,
  schema,
  errors,
  setErrors
) => {
  let error = '';

  if (!input[field]) {
    setErrors &&
      setErrors({
        ...errors,
        [field]: '',
      });
    return '';
  }

  try {
    await schema.validateAt(field, input, {
      abortEarly: false,
    });
  } catch (err) {
    error = err?.message;
  }

  setErrors &&
    setErrors({
      ...errors,
      [field]: error,
    });
  return error;
};
