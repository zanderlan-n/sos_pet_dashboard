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
import {
  mappedServiceNames,
  mappedMettingStatus,
  weekDays,
  PAGESIZE,
  MeetingStatus,
  ServicesTypes,
  updatableMeetingStatus,
  MENTORSHIP_MAX_DURATION,
} from '../../config/constants';
import DateField from '../../components/DateField';
import Pagination from '../../components/Pagination';
import Table from '../../components/Table';
import { MinutesToHours } from '../../utils/parsers';
import './Animals.scss';
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
  const { id } = useParams();
  const [activePage, setActivePage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [meetingInput, setMeetingInput] = useState({});
  const [sessions, setSessions] = useState([{ duration: 0, date: undefined }]);
  const firstValidTime = addMinutes(addHours(addDays(new Date(), 1), 2), 30);
  const [searchDate, setSearchDate] = useState(null);
  const [invalidDates, setInvalidDates] = useState([]);
  const [disableFields, setDisableFields] = useState(false);
  const [errors, setErrors] = useState({});
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const onRowClick = (userId) => history.push(`/users/${userId}`);
  const [cancelMeeting] = useMutation(CANCEL_MEETING);
  const tomorrow = addDays(new Date(), 1);
  const history = useHistory();
  const toast = useToast();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setFirstValidDate = (date) => {
    if (timeTable && !isLastDayOfMonth(date)) {
      const weekday = getWeekDay(date);
      const isAvailable = availableDay(date);

      if (
        timeTable[weekDays[weekday].id] &&
        !isFirstValidDay(date) &&
        isAvailable
      )
        return date;
      return setFirstValidDate(addDays(date, 1));
    }
    return undefined;
  };

  const isFirstValidDay = useCallback(
    (date) => {
      let lastTimeTomorrow = null;
      const sameDay = isSameDay(date, tomorrow);
      if (timeTable[weekDays[getWeekDay(tomorrow)]?.id]) {
        lastTimeTomorrow = tomorrow.setHours(
          timeTable[weekDays[getWeekDay(tomorrow)]?.id][1] - 1,
          59,
          59,
          999
        );
      }
      if (isAfter(firstValidTime, lastTimeTomorrow) && sameDay) return true;
      return false;
    },
    [firstValidTime, timeTable, tomorrow]
  );

  const handleCancelMeeting = () => {
    if (!isConfirmingCancel) {
      setIsConfirmingCancel(true);
      setTimeout(() => setIsConfirmingCancel(false), 4000);
    } else {
      doCancelMeeting();
    }
  };

  const doCancelMeeting = async () => {
    setIsConfirmingCancel(false);

    try {
      const { data } = await cancelMeeting({ variables: { id } });
      const canceledMeeting = data.cancelMeeting;
      setMeetingInput({
        mentorName: canceledMeeting?.mentorProfile?.name,
        ...canceledMeeting,
      });
      refetchMeeting();
      toast('Sessão cancelada com sucesso!');
    } catch (err) {
      setErrors({ ...errors, msg: 'Não foi possivel cancelar a sessão.' });
    }
  };

  const availableDay = (date) => {
    let state = true;
    sessions.forEach((session) => {
      if (session.date && isSameDay(session.date, date)) {
        state = false;
      }
    });
    return state;
  };

  const {
    data: meetingData,
    loading: loadingMeeting,
    error: meetingError,
    refetch: refetchMeeting,
  } = useQuery(FETCH_MEETING, {
    variables: { id },
  });
  const meeting = useMemo(() => {
    if (!meetingData || loadingMeeting || meetingError) {
      return {};
    }
    setSearchDate(meetingData.meeting.date);
    return meetingData?.meeting;
  }, [meetingData, loadingMeeting, meetingError]);

  const {
    data: serviceData,
    loading: loadingService,
    error: serviceError,
  } = useQuery(FETCH_SERVICE, {
    variables: {
      id: meeting?.service,
    },
    skip: _.isEmpty(meeting),
  });
  const timeTable = useMemo(() => {
    if (!serviceData || loadingService || serviceError) {
      return {};
    }
    const serviceTimes = serviceData?.service?.meta?.timeTable;

    setDisableFields(
      (meetingInput.type === serviceTimes.Consultancy &&
        !timeTableIsEmpty(serviceTimes)) ||
        !updatableMeetingStatus.some((ele) => ele === meetingInput.status)
    );
    return serviceTimes;
  }, [serviceData, loadingService, serviceError, meetingInput]);

  const {
    data: availableTimesData,
    loading: loadingTimes,
    error: timesError,
  } = useQuery(FETCH_AVAILABLE_TIMES, {
    variables: {
      id: meeting?.service,
      date: searchDate
        ? format(setHours(searchDate, 12), 'yyyy-MM-dd')
        : new Date(),
      hoursBeforeAvailable: 1,
    },
    skip: !searchDate,
  });

  const availableTimes = useMemo(() => {
    if (
      !availableTimesData ||
      loadingTimes ||
      timesError ||
      isBefore(searchDate, startOfDay(new Date())) ||
      meetingInput.type === ServicesTypes.mentorship
    ) {
      return [];
    }
    const available = availableTimesData?.availableTimes?.available;
    if (available.length === 0) {
      setInvalidDates(invalidDates.concat(searchDate));
      setSearchDate(setFirstValidDate(addDays(searchDate, 1)));
    }
    return available;
  }, [
    availableTimesData,
    invalidDates,
    loadingTimes,
    meetingInput.type,
    searchDate,
    setFirstValidDate,
    timesError,
  ]);

  const excludeTimes = useMemo(() => {
    if (
      meetingInput.type === ServicesTypes.mentorship &&
      isSameDay(searchDate, new Date())
    ) {
      const date = startOfDay(new Date());
      const time = minutesOfDay(new Date(), date);
      return new Array(Math.ceil(time / 30)).fill(0).map((item, i) => {
        return addMinutes(new Date(date), i * 30);
      });
    }
    return undefined;
  }, [meetingInput.type, searchDate]);

  const includeTimes = useMemo(() => {
    if (
      meetingInput.type === ServicesTypes.mentorship &&
      isAfter(searchDate, subDays(new Date(), 1))
    ) {
      return undefined;
    }
    return availableTimes
      .map((minutes) => {
        return addMinutes(
          startOfDay(searchDate ? new Date(searchDate) : new Date()),
          minutes
        );
      })
      .filter((date) => {
        return isAfter(date, addMinutes(new Date(), -1));
      });
  }, [availableTimes, meetingInput, searchDate]);

  const availableDuration = useMemo(() => {
    let available = 0;
    if (meetingInput.type === ServicesTypes.mentorship) {
      available = MENTORSHIP_MAX_DURATION;
    } else if (searchDate && availableTimes.length) {
      const slotStart = minutesOfDay(searchDate);
      const index = availableTimes.indexOf(slotStart);
      const nextSlots = availableTimes.slice(index);
      let ignoreRest = false;
      available =
        nextSlots.reduce((lastAvailable, slot, i) => {
          if (i === 0 || ignoreRest) {
            return lastAvailable;
          }

          if (slot - nextSlots[i - 1] > 30) {
            ignoreRest = true;
            return lastAvailable;
          }

          return lastAvailable + 1;
        }, 0) + 1;
    }
    return available;
  }, [availableTimes, meetingInput.type, searchDate]);

  const filterInvalidDates = useCallback(
    (date) => {
      const today = startOfDay(new Date());

      if (!timeTable || isBefore(date, today)) {
        return false;
      }
      if (meetingInput.type === ServicesTypes.mentorship) {
        return true;
      }
      const weekday = getWeekDay(date);
      if (!timeTable[weekDays[weekday].id]) {
        return false;
      }

      if (
        sessions.some((session) => {
          return isSameDay(session.date, date);
        })
      ) {
        return false;
      }

      if (isFirstValidDay(date)) {
        return false;
      }

      let isValid = true;
      invalidDates.forEach((invalidDate) => {
        if (isSameDay(invalidDate, date)) {
          isValid = false;
        }
      });

      return isValid;
    },
    [timeTable, meetingInput.type, sessions, isFirstValidDay, invalidDates]
  );

  const handleMeetingChange = (newValues) => {
    setMeetingInput({
      ...meetingInput,
      ...newValues,
    });
  };

  const {
    data: mentorshipSubscriberData,
    loading: mentorshipSubscriberLoading,
    error: mentorshipSubscriberError,
  } = useQuery(FETCH_USERS_BY_MEETING, {
    variables: {
      id: meeting?.id,
    },
    skip: _.isEmpty(meeting),
  });

  const usersByMeetings = useMemo(() => {
    if (
      !mentorshipSubscriberData ||
      mentorshipSubscriberLoading ||
      mentorshipSubscriberError
    ) {
      return [];
    }
    setTotalCount(mentorshipSubscriberData?.usersByMeeting?.totalCount);
    const users = mentorshipSubscriberData?.usersByMeeting?.items;

    return users;
  }, [
    mentorshipSubscriberData,
    mentorshipSubscriberError,
    mentorshipSubscriberLoading,
  ]);

  const [updateMeeting] = useMutation(UPDATE_MEETING);
  const isUpdated = () => {
    return (
      meeting.date !== meetingInput.date ||
      meeting.duration !== meetingInput.duration ||
      meeting.title !== meetingInput.title
    );
  };

  const handleSave = async () => {
    const newMeeting = {
      date: meetingInput.date,
      duration: meetingInput.duration,
      title: meetingInput.title,
      status: MeetingStatus.OPENED,
    };
    if (isUpdated()) {
      try {
        const { data } = await updateMeeting({
          variables: { id, meeting: newMeeting },
        });
        const updatedMeeting = data.updateMeeting;
        setMeetingInput({
          mentorName: updatedMeeting?.mentorProfile?.name,
          ...updatedMeeting,
        });
        toast('Sessão atualizada com sucesso!');
      } catch (err) {
        setErrors({ ...errors, msg: 'Ocorreu uma falha na atualização' });
      }
    }
  };

  useEffect(() => {
    if (_.isEmpty(meetingInput) && !_.isEmpty(meeting)) {
      setMeetingInput({
        mentorName: meeting?.mentorProfile?.name,
        ...meeting,
      });
    }
  }, [meeting, meetingInput]);

  if (loadingMeeting) {
    return loadingView();
  }

  return (
    <div className="animated fadeIn">
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader className="font-weight-bold  text-dark">
              Sessão
            </CardHeader>
            <CardBody>
              <Col className="mb-4 pl-0">
                <FormGroup>
                  <Label className="font-weight-bold" htmlFor="id">
                    ID
                  </Label>
                  <Input
                    type="text"
                    id="id"
                    defaultValue={meetingInput?.id || ''}
                    readOnly
                  />
                </FormGroup>
                <FormGroup>
                  <Label className="font-weight-bold" htmlFor="title">
                    Título
                  </Label>
                  <Input
                    type="text"
                    id="title"
                    value={meetingInput?.title || ''}
                    onChange={(e) =>
                      handleMeetingChange({ title: e.target.value })
                    }
                    placeholder="Entre o título da sessão"
                    readOnly={disableFields}
                  />
                </FormGroup>
                <div className="d-flex flex-column flex-sm-row">
                  <DateField
                    className="w-100"
                    id="date"
                    value={searchDate}
                    timeCaption="Hora"
                    timeIntervals={30}
                    onChange={(value) => {
                      if (value) {
                        setSearchDate(value);
                        handleMeetingChange({ duration: null, date: value });
                      }
                    }}
                    includeTimes={includeTimes}
                    excludeTimes={excludeTimes}
                    filterDate={filterInvalidDates}
                    disabled={disableFields}
                  />
                  <DurationSelector
                    handleMeetingChange={handleMeetingChange}
                    availableDuration={availableDuration}
                    duration={meetingInput.duration}
                    disabled={
                      disableFields || isBefore(meetingInput.date, new Date())
                    }
                  />
                </div>
                <FormGroup>
                  <Label className="font-weight-bold" htmlFor="brainer">
                    Brainer
                  </Label>
                  <Input
                    type="text"
                    id="brainer"
                    readOnly
                    defaultValue={meetingInput.mentorName || ''}
                  />
                </FormGroup>
                <FormGroup>
                  <Label className="font-weight-bold" htmlFor="type">
                    Tipo
                  </Label>
                  <Input
                    type="text"
                    id="type"
                    readOnly
                    defaultValue={mappedServiceNames[meetingInput?.type] || ''}
                  />
                </FormGroup>
                <FormGroup>
                  <Label className="font-weight-bold" htmlFor="status">
                    Status
                  </Label>
                  <Input
                    type="text"
                    id="status"
                    readOnly
                    defaultValue={
                      mappedMettingStatus[meetingInput?.status] || ''
                    }
                  />
                </FormGroup>
                <div>
                  <Label className="font-weight-bold" htmlFor="subscribers">
                    Cliente
                  </Label>
                  <Table
                    data={usersByMeetings}
                    heads={headers}
                    showFilter={false}
                    onClick={onRowClick}
                  />
                  <Pagination
                    activePage={activePage}
                    totalPages={totalCount / PAGESIZE}
                    onPageChange={(newPage) => {
                      setActivePage(newPage);
                    }}
                  />
                </div>
              </Col>{' '}
              {errors.msg && (
                <Alert
                  color="danger"
                  className="m-0 p-2 mb-2 mb-md-0 w-md-auto mr-0 mr-md-2 col-12 col-md-auto"
                >
                  {errors.msg}
                </Alert>
              )}
              {!disableFields && (
                <Col className="d-flex flex-column flex-md-row ml-auto align-items-center justify-content-end pr-0 pl-0 mt-5">
                  <Button
                    className="action-button font-weight-bold text-white col-lg-2 col-md-4 col-sm-12"
                    color="danger"
                    onClick={handleCancelMeeting}
                  >
                    {isConfirmingCancel ? 'Clique para confirmar' : 'Cancelar'}
                  </Button>

                  <Button
                    className={`
                    ${
                      meetingInput.duration && isUpdated()
                        ? 'bg-primary'
                        : 'bg-secondary'
                    }
                     action-button  ml-auto mt-2 mt-sm-0 font-weight-bold text-white w-100 col-lg-2 col-md-4 col-sm-12`}
                    disabled={!meetingInput.duration || !isUpdated()}
                    onClick={() => handleSave()}
                  >
                    Salvar
                  </Button>
                </Col>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
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
