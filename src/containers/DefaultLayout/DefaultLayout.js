import React, { Suspense, useEffect } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import * as router from 'react-router-dom';
import { Container } from 'reactstrap';

import {
  AppFooter,
  AppHeader,
  AppSidebar,
  AppSidebarFooter,
  AppSidebarForm,
  AppSidebarHeader,
  AppBreadcrumb2 as AppBreadcrumb,
  AppSidebarNav2 as AppSidebarNav,
} from '@coreui/react';
// sidebar nav config
import navigation from '../../_nav';
// routes config
import routes from '../../routes';
import authManager from '../../services/auth';
import useToast from '../../hooks/useToast';
import loading from '../../components/Loading';

const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));

const DefaultLayout = ({ history, ...props }) => {
  const toast = useToast();

  const signOut = (e) => {
    e.preventDefault();
    authManager.clear();
    history.push('/login');
  };

  if (!authManager.get()) {
    toast('Sua sessão expirou! Faça o login novamente.');
    return <Redirect strict push to="/login" />;
  }

  return (
    <div className="app">
      <AppHeader fixed>
        <Suspense fallback={loading()}>
          <DefaultHeader onLogout={(e) => signOut(e)} />
        </Suspense>
      </AppHeader>
      <div className="app-body">
        <AppSidebar fixed display="lg">
          <AppSidebarHeader />
          <AppSidebarForm />
          <Suspense>
            <AppSidebarNav
              navConfig={navigation()}
              {...props}
              router={router}
            />
          </Suspense>
          <AppSidebarFooter />
        </AppSidebar>
        <main className="main">
          <AppBreadcrumb appRoutes={routes()} router={router} />
          <Container fluid>
            <Suspense fallback={loading()}>
              <Switch>
                {routes().map((route, idx) => {
                  return route.component ? (
                    <Route
                      key={idx}
                      path={route.path}
                      exact={route.exact}
                      name={route.name}
                      render={({ ...prps }) => <route.component {...prps} />}
                    />
                  ) : null;
                })}
                <Redirect from="/" to="/users" />
              </Switch>
            </Suspense>
          </Container>
        </main>
      </div>
      <AppFooter>
        <Suspense fallback={loading()}>
          <DefaultFooter />
        </Suspense>
      </AppFooter>
    </div>
  );
};

export default DefaultLayout;
