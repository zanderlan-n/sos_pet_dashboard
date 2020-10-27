import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useParams, useHistory } from 'react-router-dom';
import PT from 'prop-types';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Input,
  FormGroup,
  Label,
  Button,
  DropdownToggle,
  DropdownMenu,
  Dropdown,
  Alert,
  DropdownItem,
} from 'reactstrap';
import gql from 'graphql-tag';
import _ from 'lodash';
import './Pets.scss';
const meetingFragment = gql`
  fragment meetingFragment on Meeting {
    id
    title
    status
    date
    type
    duration
    service
    mentorProfile {
      name
    }
  }
`;
const Pet = () => {
  const { id } = useParams();
  return <div>{id}</div>;
};

Pet.propTypes = {};

export default Pet;
