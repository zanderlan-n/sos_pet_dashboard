import React, { Component } from 'react';
import { Button, Nav } from 'reactstrap';
import PropTypes from 'prop-types';

import { AppNavbarBrand, AppSidebarToggler } from '@coreui/react';
import logo from '../../assets/img/pet_logo.png';
import sygnet from '../../assets/img/brand/sygnet.svg';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

const DefaultHeader = ({ onLogout }, props) => {
  const { children, ...attributes } = props;
  return (
    <>
      <AppSidebarToggler className="d-lg-none" display="md" mobile />
      <AppNavbarBrand
        full={{ src: logo, width: 110, height: 30, alt: 'SOS Pet Logo' }}
        minimized={{
          src: sygnet,
          width: 35,
          height: 35,
          alt: 'SOS Pet Logo',
        }}
      />

      <Nav className="ml-auto" navbar>
        <Button
          className="mr-lg-4 btn-ghost-primary"
          onClick={(e) => onLogout(e)}
        >
          {' '}
          <i className="fa fa-sign-out " /> Sair
        </Button>
      </Nav>
    </>
  );
};

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
