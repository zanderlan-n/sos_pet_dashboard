import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultFooter extends Component {
  render() {
    const { children, ...attributes } = this.props;

    return (
      <>
        <span className="ml-auto text-muted">
          <a>S.O.S. PET {new Date().getFullYear()}</a>
        </span>
      </>
    );
  }
}

DefaultFooter.propTypes = propTypes;
DefaultFooter.defaultProps = defaultProps;

export default DefaultFooter;
