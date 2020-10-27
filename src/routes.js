import React from 'react';
import useSession from './hooks/useSession';

const Pets = React.lazy(() => import('./views/Pets/Pets'));
const Pet = React.lazy(() => import('./views/Pets/Pet'));
const User = React.lazy(() => import('./views/Users/User'));

const Meetings = React.lazy(() => import('./views/Meetings/Meetings'));
const Subscriptions = React.lazy(() =>
  import('./views/Subscriptions/Subscriptions')
);

const Routes = () => {
  const { user } = useSession();
  const routes = [
    { path: '/', exact: true, name: 'Home' },
    { path: '/pets', exact: true, name: 'Pets', component: Pets },
    { path: '/pet/:id', exact: true, name: 'Pet', component: Pet },

    { path: '/user', exact: true, name: 'Minha conta', component: User },
    // {
    //   path: '/users/new',
    //   exact: true,
    //   name: 'Cadastrar',
    //   component: NewUser,
    // },
    // { path: '/users/:id', exact: true, name: 'Detalhes', component: User },
    // {
    //   path: '/users/:id/comments',
    //   exact: true,
    //   name: 'Comentários',
    //   component: UserComments,
    // },
    {
      path: '/subscriptions',
      exact: true,
      name: 'Inscrições',
      component: Subscriptions,
    },
    { path: '/meetings', exact: true, name: 'Sessões', component: Meetings },
    // {
    //   path: '/meetings/:id',
    //   exact: true,
    //   name: 'Detalhes da Sessão',
    //   component: Meeting,
    // },
  ];

  return routes;
};

export default Routes;
