import defaultUserImage from '../assets/img/icon-user.svg';
import defaultPetImage from '../assets/img/icon-pet.png';
import { API_BASE_URL } from '../endpoints';

export const DEFAULT_IMAGES = {
  USER: defaultUserImage,
  PET: defaultPetImage,
};

export const checkImage = ({ img, type }) => {
  return img || DEFAULT_IMAGES[type];
};

export const getImgUrl = (url) => {
  return API_BASE_URL + url;
};
