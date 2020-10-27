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
import {
  setHours,
  isAfter,
  addHours,
  addMinutes,
  startOfDay,
  differenceInMinutes,
  getDay,
  format,
  isSameDay,
  addDays,
  isBefore,
  isLastDayOfMonth,
  subDays,
} from 'date-fns';

import DateField from '../../components/DateField';
import Pagination from '../../components/Pagination';
import Table from '../../components/Table';
import { MinutesToHours } from '../../utils/parsers';
import './Pets.scss';
import loadingView from '../../components/Loading';
import useToast from '../../hooks/useToast';

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
const FETCH_USERS_BY_MEETING = gql`
  query usersByMeeting($id: String!) {
    usersByMeeting(id: $id) {
      items {
        ... on User {
          id
          email
          profile {
            name
            slug
          }
        }
      }
      totalCount
    }
  }
`;

const CANCEL_MEETING = gql`
  mutation cancelMeeting($id: String!) {
    cancelMeeting(id: $id) {
      ...meetingFragment
    }
  }
  ${meetingFragment}
`;

const FETCH_SERVICE = gql`
  query service($id: String!) {
    service(id: $id) {
      meta
    }
  }
`;

const UPDATE_MEETING = gql`
  mutation updateMeeting($id: String!, $meeting: MeetingInput!) {
    updateMeeting(id: $id, meeting: $meeting) {
      ...meetingFragment
    }
  }
  ${meetingFragment}
`;

const FETCH_MEETING = gql`
  query meeting($id: String!) {
    meeting(id: $id) {
      ...meetingFragment
    }
  }
  ${meetingFragment}
`;
const FETCH_AVAILABLE_TIMES = gql`
  query availableTimes(
    $id: String!
    $date: String!
    $hoursBeforeAvailable: Int
  ) {
    availableTimes(
      id: $id
      date: $date
      hoursBeforeAvailable: $hoursBeforeAvailable
    ) {
      available
    }
  }
`;
const getWeekDay = (date) => {
  const weekDay = getDay(date) - 1;
  return weekDay < 0 ? 6 : weekDay;
};

const minutesOfDay = (date) => differenceInMinutes(date, startOfDay(date));

const DurationSelector = React.memo(
  ({ duration, handleMeetingChange, availableDuration, disabled }) => {
    const [dropdownStatus, setDropdownStatus] = useState(false);
    const durationOptions = useMemo(() => {
      return new Array(availableDuration).fill(0).map((_, index) => {
        const dur = (index + 1) * 30;
        const hours = Math.floor(dur / 60);
        const minutes = dur % 60;
        const formatted = [];

        if (hours === 1) formatted.push('1 hora');
        else if (hours > 0) formatted.push(`${hours} horas`);

        if (minutes > 0) {
          formatted.push(`${minutes} minutos`);
        }

        return { value: dur, name: formatted.join(' e ') };
      });
    }, [availableDuration]);

    const handleDurationChange = useCallback(
      (value) => {
        handleMeetingChange({ duration: value ? Number(value) : undefined });
      },
      [handleMeetingChange]
    );

    return (
      <FormGroup className="col-sm-4 col-md-2 col-12 p-0 ml-sm-3 minw-200">
        <Label className="font-weight-bold" htmlFor="duration">
          Qual a duração?
        </Label>
        <Dropdown
          disabled={disabled}
          isOpen={dropdownStatus}
          toggle={() => setDropdownStatus(!dropdownStatus)}
        >
          <DropdownToggle
            className={`${
              disabled ? '' : 'bg-white'
            } text-dark w-100 d-flex align-items-center`}
            id="dropdownBtn"
            disabled={disabled}
          >
            {duration ? MinutesToHours(duration, 'long') : 'Selecione'}
            {!disabled && <i className="fa fa-angle-down ml-auto" />}
          </DropdownToggle>
          <DropdownMenu
            className="w-100"
            aria-labelledby="dropdownMenu"
            id="date-dropdown-menu"
          >
            {durationOptions.map((item) => (
              <DropdownItem
                key={`index-${item.value}`}
                value={item.value}
                active={item.value === duration}
                onClick={() => handleDurationChange(item.value)}
              >
                {item.name}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </FormGroup>
    );
  }
);

const DatePickerInput = ({ date, ...props }) => {
  return <input value={date} {...props} readOnly />;
};

const headers = [
  {
    minWidth: '4',
    size: '4',
    value: ({ profile }) => profile.name,
    name: 'Nome',
  },
  { minWidth: '4', size: '4', value: 'email', name: 'E-mail' },
  {
    minWidth: '4',
    size: '4',
    value: ({ profile }) => profile.slug,
    name: 'Slug',
  },
];

const timeTableIsEmpty = (timeTable) => {
  delete timeTable._id;
  return Object.keys(timeTable).find((key) => !!timeTable[key]?.length);
};

const Meeting = () => {
  return <div></div>;
};

DatePickerInput.propTypes = {
  date: PT.string.isRequired,
};

DurationSelector.propTypes = {
  duration: PT.number.isRequired,
  handleMeetingChange: PT.func.isRequired,
  availableDuration: PT.number.isRequired,
  disabled: PT.bool.isRequired,
};

export default Meeting;
