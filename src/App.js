import React from 'react';
import { configure } from 'axios-hooks';
import LRU from 'lru-cache';
import Axios from 'axios';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { ApolloProvider } from '@apollo/react-hooks';
import jwt from 'jsonwebtoken';

import client from './lib/apolloClient';
import { SessionProvider } from './context/SessionContext';
import authManager from './services/auth';
import loading from './components/Loading';

import './App.scss';
import 'antd/dist/antd.css';
import 'react-toastify/dist/ReactToastify.css';

// Containers
const DefaultLayout = React.lazy(() => import('./containers/DefaultLayout'));

// Pages
const Login = React.lazy(() => import('./views/Pages/Login'));
const Register = React.lazy(() => import('./views/Pages/Register'));
const Page404 = React.lazy(() => import('./views/Pages/Page404'));
const Page500 = React.lazy(() => import('./views/Pages/Page500'));
const ForgetPassword = React.lazy(() => import('./views/Pages/ForgetPassword'));
const RecoverPassword = React.lazy(() =>
  import('./views/Pages/RecoverPassword')
);

const axios = Axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
});

const cache = new LRU({ max: 10 });

configure({ axios, cache });

const App = () => {
  const sessionState = jwt.decode(authManager.get());
  return (
    <ApolloProvider client={client}>
      <SessionProvider
        initialSession={sessionState ? { user: sessionState } : { user: null }}
      >
        <HashRouter>
          <React.Suspense fallback={loading()}>
            <Switch>
              <Route
                exact
                path="/login"
                name="Login Page"
                render={(props) => <Login {...props} />}
              />
              <Route
                exact
                path="/register"
                name="Register Page"
                render={(props) => <Register {...props} />}
              />
              <Route
                exact
                path="/forget-password"
                name="Forget Password Page"
                render={(props) => <ForgetPassword {...props} />}
              />{' '}
              <Route
                exact
                path="/recover-password/:token"
                name="Recover Password Page"
                render={(props) => <RecoverPassword {...props} />}
              />
              <Route
                exact
                path="/404"
                name="Page 404"
                render={(props) => <Page404 {...props} />}
              />
              <Route
                exact
                path="/500"
                name="Page 500"
                render={(props) => <Page500 {...props} />}
              />
              <Route
                path="/"
                name="Home"
                render={(props) => <DefaultLayout {...props} />}
              />
            </Switch>
          </React.Suspense>
        </HashRouter>
      </SessionProvider>
    </ApolloProvider>
  );
};

export default App;
