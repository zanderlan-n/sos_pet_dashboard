/**
 *
 * SocialLink
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { API_BASE_URL } from '../endpoints';

function SocialLink({ provider }) {
  return (
    <a href={`${API_BASE_URL}/connect/${provider}`} className="link w-50">
      <Button
        style={{ backgroundColor: '#3A5794', color: 'white' }}
        className="w-100 font-weight-bold"
        type="button"
        social={provider}
      >
        <i className={`fa fa-${provider} mr-2`} />
        {provider.toUpperCase()}
      </Button>
    </a>
  );
}

SocialLink.propTypes = {
  provider: PropTypes.string.isRequired,
};

export default SocialLink;
