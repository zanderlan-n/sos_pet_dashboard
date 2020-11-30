import React, {
  useState,
  useMemo,
  useCallback,
  useContext,
  useRef,
} from 'react';

import _ from 'lodash';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownMenu,
  Col,
  Button,
  Input,
  Label,
} from 'reactstrap';
import { useHistory } from 'react-router-dom';
import PT from 'prop-types';
import { SessionContext } from '../../context/SessionContext';
import { mappedPetStatus } from '../../config/constants';
import loadingView from '../Loading';
import CardsGrid from '../CardsGrid';
import { getImgUrl } from '../ImagesBuilder';
import useToast from '../../hooks/useToast';

import * as defaultPetImage from '../../assets/img/icon-pet.png';

const FETCH_ANIMALS = gql`
  query animals($where: JSON) {
    animals(where: $where) {
      id
      color
      last_seen
      description
      size
      location
      type
      status
      age
      image {
        id
        url
        name
      }
    }
  }
`;

const PetsView = ({ isMyPetsView }) => {
  const toast = useToast();
  const history = useHistory();
  const [actionFilter, setActionFilter] = useState(0);
  const [locationFilter, setLocationFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const actionFilterOptions = [
    { value: null, label: 'Todos' },
    { value: 'lost', label: 'Perdidos' },
    { value: 'found', label: 'Encontrados' },
    { value: 'forAdoption', label: 'Para Adoção' },
    { value: 'adopted', label: 'Adotados' },
  ];
  const setLocationSearch = useRef(
    _.debounce((value) => {
      setLocationFilter(value);
    }, 500)
  ).current;

  const { user } = useContext(SessionContext);
  const { data, error, loading } = useQuery(FETCH_ANIMALS, {
    variables: {
      where: {
        ...(isMyPetsView && {
          user: { id: user.id },
        }),
        ...(locationFilter && { location_contains: locationFilter }),
        ...(dateFilter && { last_seen_gte: dateFilter }),
        ...(actionFilter && {
          status: actionFilterOptions[actionFilter].value,
        }),
      },
    },
    fetchPolicy: 'no-cache',
  });
  const handleClick = useCallback(
    (id) => {
      if (isMyPetsView) {
        history.push(`/pet/${id}/edit`);
      } else {
        history.push(`/pet/${id}`);
      }
    },
    [history]
  );

  const animals = useMemo(() => {
    if (!data || loading || error) {
      return [];
    }
    return data.animals.map((item) => {
      return {
        data: {
          status: (
            <div className="px-2 pt-2">
              <i className="fa fa-bullhorn" />
              <span className="ml-2">{mappedPetStatus[item.status]}</span>
            </div>
          ),

          description: (
            <div
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              className="px-2 pt-2"
            >
              <i className="fa fa-comment-o" />
              <span className="ml-2">{item.description}</span>
            </div>
          ),
          color: (
            <div className="px-2 pt-2">
              <i className="fa fa-paint-brush" />
              <span className="ml-2">{item.color}</span>
            </div>
          ),
          location: (
            <div className="px-2 pt-2">
              <i className="fa fa-map-marker" />
              <span className="ml-2">{item.location}</span>
            </div>
          ),
        },
        id: item.id,
        action: handleClick,
        image:
          item?.image?.length > 0
            ? getImgUrl(item.image[0].url)
            : defaultPetImage,
      };
    });
  }, [data, error, handleClick, loading]);
  const handleNewPet = () => {
    history.push('/pet/new');
  };
  if (error) {
    toast('Não foi possivel realizar sua busca!Tente novamente mais tarde.');
  }
  return (
    <div className="animated fadeIn">
      <Col className="mf-auto mb-4 px-0 d-flex flex-column flex-sm-row ">
        <Dropdown
          className="mr-0 mr-sm-4"
          isOpen={dropdownOpen}
          toggle={() => setDropdownOpen(!dropdownOpen)}
        >
          <DropdownToggle
            className="font-weight-bold mr-sm-0 w-100 w-sm-0 mb-2 mb-sm-0 px-0"
            style={{ minWidth: 100 }}
          >
            {actionFilterOptions[actionFilter].label}{' '}
            <i className="fa fa-angle-down ml-auto" />
          </DropdownToggle>
          <DropdownMenu className="w-100 w-sm-0">
            {actionFilterOptions.map((item, i) => (
              <DropdownItem
                active={i === actionFilter}
                key={i}
                onClick={() => setActionFilter(i)}
              >
                {item.label}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
        <div className="px-0 d-flex flex-row ">
          <Label className="mr-2 mb-0 font-weight-bold align-self-center">
            Última vez visto:
          </Label>

          <Col className="px-0 mr-0 mr-sm-4 w-100 w-sm-25">
            <Input
              className="w-100 w-sm-25"
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
              }}
            />
          </Col>
        </div>

        <Col className="px-0 d-flex flex-row my-3 my-sm-0">
          <Label className="mr-2 mb-0 font-weight-bold align-self-center">
            Bairro/Setor:
          </Label>

          <Col md={3} className="px-0 mr-0 mr-sm-4">
            <Input
              type="text"
              onChange={(e) => {
                setLocationSearch(e.target.value);
              }}
            />
          </Col>
        </Col>
        {isMyPetsView && (
          <Button
            style={{ color: '#fff' }}
            onClick={handleNewPet}
            color="primary"
          >
            Cadastrar Pet
          </Button>
        )}
      </Col>
      {loading ? loadingView() : <CardsGrid data={animals} />}
    </div>
  );
};

export default PetsView;
PetsView.propTypes = {
  isMyPetsView: PT.bool,
};

PetsView.defaultProps = {
  isMyPetsView: false,
};
