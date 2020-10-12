import { toast } from 'react-toastify';

export default () => {
  toast.configure({
    position: 'bottom-center',
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    type: toast.TYPE.DEFAULT,
  });

  return toast;
};
