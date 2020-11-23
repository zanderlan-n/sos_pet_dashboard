import React, { useState } from 'react';
import PT from 'prop-types';
import { Button, Spinner } from 'reactstrap';
import axios from 'axios';
import authManager from '../services/auth';
import { DEFAULT_IMAGES, getImgUrl } from './ImagesBuilder';
import { API_BASE_URL } from '../endpoints';

const FileUploadButton = ({
  url,
  onSuccess,
  onFailure,
  size,
  defaultImageType,
  submitForm,
}) => {
  const [loading, setLoading] = useState(false);

  const [images, setImages] = useState([]);
  const onImageChange = (event) => {
    const output = document.getElementById('output');
    output.src = URL.createObjectURL(event.target.files[0]);
    output.onload = () => {
      URL.revokeObjectURL(output.src);
    };
    setImages(event.target.files);
  };

  const onSubmit = (e) => {
    setLoading(true);
    e.preventDefault();

    const formData = new FormData();

    Array.from(images).forEach((image) => {
      formData.append('files', image);
    });

    const token = authManager.get();
    axios
      .post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setLoading(false);
        onSuccess({ id: res.data[0]._id });
        setImages([]);
      })
      .catch((err) => {
        setLoading(false);
        onFailure();
        setImages([]);
        console.error(err);
      });
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div className="d-flex flex-column">
          <input
            type="file"
            id="filesId"
            name="files"
            onChange={onImageChange}
            alt="image"
            style={{ display: 'none' }}
          />
          <label className="cursor-pointer" htmlFor="filesId">
            <div style={{ width: `${size}` }}>
              <img
                src={url ? getImgUrl(url) : DEFAULT_IMAGES[defaultImageType]}
                id="output"
                alt="user"
                style={{
                  maxWidth: '100%',
                  width: size,
                  borderRadius: '0.8em',
                  maxHeight: '343px',
                }}
              />
            </div>
          </label>
          <Button type="submit" disabled={images.length === 0}>
            {loading ? <Spinner size="sm" /> : 'Salvar Imagem'}
          </Button>
        </div>
      </form>
    </div>
  );
};

FileUploadButton.propTypes = {
  url: PT.string.isRequired,
  onSuccess: PT.func.isRequired,
  onFailure: PT.func.isRequired,
  size: PT.string.isRequired,
  defaultImageType: PT.string.isRequired,
};

export default FileUploadButton;
