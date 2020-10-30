import React from 'react';
import useSession from './hooks/useSession';

const Pets = React.lazy(() => import('./views/Pets/Pets'));
const Pet = React.lazy(() => import('./views/Pets/Pet'));
const User = React.lazy(() => import('./views/Users/User'));

const Routes = () => {
  const { user } = useSession();
  const routes = [
    { path: '/', exact: true, name: 'Home' },
    { path: '/pets', exact: true, name: 'Pets', component: Pets },
    { path: '/pet/:id', exact: true, name: 'Pet', component: Pet },
    { path: '/my_pets', exact: true, name: 'Meus Pets', component: Pets },

    { path: '/user', exact: true, name: 'Minha conta', component: User },
  ];

  return routes;
};

export default Routes;
