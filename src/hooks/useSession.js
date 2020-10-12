import { useContext } from 'react';
import { SessionContext } from '../context/SessionContext';

export default () => {
  return useContext(SessionContext);
};
