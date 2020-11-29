import axios from 'axios';

export const socialLogin = async (url, handleSuccess, handleError) => {
  return axios
    .get(url)
    .then((data) => {
      handleSuccess(data.data);
    })
    .catch((err) => {
      console.error(err);
      handleError(true);
    });
};
