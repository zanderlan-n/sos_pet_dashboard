import React from 'react';
import useSession from './hooks/useSession';

const User = React.lazy(() => import('./views/Users/User'));
const Users = React.lazy(() => import('./views/Users/Users'));
const NewUser = React.lazy(() => import('./views/Users/New'));
const UserComments = React.lazy(() => import('./views/Users/Comments'));
const Meeting = React.lazy(() => import('./views/Meetings/Meeting'));
const Animal = React.lazy(() => import('./views/Animals/Animal'));
const Animals = React.lazy(() => import('./views/Animals/Animals'));

const Meetings = React.lazy(() => import('./views/Meetings/Meetings'));
const Subscriptions = React.lazy(() =>
  import('./views/Subscriptions/Subscriptions')
);
const Admin = React.lazy(() => import('./views/Admins/Admin'));
const Admins = React.lazy(() => import('./views/Admins/Admins'));
const Logs = React.lazy(() => import('./views/Logs/Logs'));

const Routes = () => {
  const { user } = useSession();
  const routes = [
    { path: '/', exact: true, name: 'Home' },
    { path: '/animals', exact: true, name: 'Animais', component: Animals },

    // { path: '/users', exact: true, name: 'Usuários', component: Users },
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
  user?.isAdmin &&
    routes.push(
      { path: '/logs', exact: true, name: 'Logs', component: Logs },
      {
        path: '/admins',
        exact: true,
        name: 'Administração',
        component: Admins,
      },
      {
        path: '/admins/new',
        exact: true,
        name: 'Novo',
        component: Admin,
      },
      { path: '/admins/:id', exact: true, name: 'Detalhes', component: Admin }
    );
  return routes;
};

export default Routes;
