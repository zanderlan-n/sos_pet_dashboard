import React, { useState, useMemo } from 'react';
import PT from 'prop-types';
import { useQuery, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import {
  Col,
  Row,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

import useToast from '../../hooks/useToast';
import { PAGESIZE } from '../../config/constants';
import Pagination from '../../components/Pagination';
import Table from '../../components/Table';

const FETCH_USER_COMMENTS = gql`
  query mentorComments($id: String!, $skip: Int) {
    mentorComments(user: $id, skip: $skip) {
      totalCount
      items {
        ... on Comment {
          message
          id
          date
          isFeatured
          author
          authorProfile {
            name
          }
        }
      }
    }
  }
`;

const FEATURE_COMMENT = gql`
  mutation featureMentorComment($id: String!, $isFeatured: Boolean!) {
    featureMentorComment(id: $id, isFeatured: $isFeatured) {
      isFeatured
    }
  }
`;

const DELETE_COMMENT = gql`
  mutation deleteMentorComment($id: String!) {
    deleteMentorComment(id: $id) {
      success
      error
    }
  }
`;

const FeaturedCheckbox = ({ value, itemId, setError, refetch }) => {
  const [setFeatured] = useMutation(FEATURE_COMMENT);

  const handleClick = async () => {
    try {
      const { data } = await setFeatured({
        variables: { id: itemId, isFeatured: !value },
      });

      if (typeof data?.featureMentorComment?.isFeatured === 'boolean') {
        await refetch();
      }
    } catch {
      setError('Não foi possivel mudar o status do comentario.');
    }
  };

  return (
    <>
      <label
        htmlFor={`checkbox-${itemId}`}
        className="switch switch-pill switch-primary"
      >
        <input
          id={`checkbox-${itemId}`}
          type="checkbox"
          className="switch-input"
          defaultChecked={value}
          onClick={handleClick}
        />
        <span className="switch-slider" />
      </label>
    </>
  );
};

const DeleteButton = ({ itemId, setError, refetch }) => {
  const [deleteComment] = useMutation(DELETE_COMMENT);
  const toast = useToast();
  const [modal, setModal] = useState(false);

  const handleDelete = async () => {
    try {
      const { data } = await deleteComment({
        variables: { id: itemId },
      });

      if (!data?.deleteMentorComment?.success) {
        throw new Error();
      }

      refetch();
      toast('Comentario deletado com sucesso!');
    } catch {
      setError('Não foi possivel excluir o comentario.');
    }

    setModal(false);
  };

  const toggle = () => setModal(!modal);

  return (
    <>
      <Modal isOpen={modal} toggle={toggle} color="danger">
        <ModalHeader>Excluir comentario</ModalHeader>
        <ModalBody>
          <b>Deseja mesmo excluir o comentario?</b>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleDelete}>
            Sim
          </Button>{' '}
          <Button color="secondary" onClick={toggle}>
            Não
          </Button>
        </ModalFooter>
      </Modal>
      <Button
        type="button"
        className="text-white"
        color="danger"
        onClick={toggle}
      >
        <i className="fa fa-trash" />
      </Button>
    </>
  );
};

const heads = [
  {
    value: 'isFeatured',
    name: 'Destacar',
    render: FeaturedCheckbox,
    size: '1',
    align: 'center',
    minWidth: '1',
  },
  { value: 'message', name: 'Mensagem', size: '6', minWidth: '3' },
  {
    value: ({ authorProfile }) => authorProfile.name,
    name: 'Autor',
    size: '2',
    minWidth: '2',
  },
  { value: 'date', name: 'Data', size: '2', minWidth: '2' },
  { size: '1', align: 'center', render: DeleteButton, minWidth: '1' },
];

const UserComments = () => {
  const [activePage, setActivePage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { id } = useParams();

  const { data, loading, error, refetch } = useQuery(FETCH_USER_COMMENTS, {
    variables: { id, skip: (activePage - 1) * PAGESIZE },
  });

  const parsedData = useMemo(() => {
    if (!data || loading || error) {
      return [];
    }

    const { items, totalCount: total } = data.mentorComments;
    setTotalCount(total);

    return items.map((item) => ({
      ...item,
      date: format(item.date, 'dd/MM/yyyy', { locale: pt }),
    }));
  }, [data, loading, error]);

  return (
    <div className="animated fadeIn">
      <Row>
        <Col lg={12}>
          <Table data={parsedData} heads={heads} refetch={refetch} />
          <Pagination
            activePage={activePage}
            totalPages={totalCount / PAGESIZE}
            onPageChange={(newPage) => {
              setActivePage(newPage);
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

const globalPropTypes = {
  itemId: PT.string.isRequired,
  setError: PT.func,
  refetch: PT.func,
};

const globalDefaultProps = {
  setError: () => {},
  refetch: () => {},
};

FeaturedCheckbox.propTypes = {
  ...globalPropTypes,
  value: PT.bool.isRequired,
};

DeleteButton.propTypes = globalPropTypes;

FeaturedCheckbox.defaultProps = globalDefaultProps;
DeleteButton.defaultProps = globalDefaultProps;

export default UserComments;
