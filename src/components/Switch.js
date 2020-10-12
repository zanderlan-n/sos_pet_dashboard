import React from 'react';
import PT from 'prop-types';

const SwitchInput = ({ value, onClick, readOnly }) => {
  return (
    <>
      <label className="switch switch-pill switch-primary mx-2">
        <input
          type="checkbox"
          className="switch-input"
          defaultChecked={value}
          onClick={onClick}
          disabled={readOnly}
        />
        <span className="switch-slider" />
      </label>
    </>
  );
};

SwitchInput.propTypes = {
  value: PT.bool,
  onClick: PT.func.isRequired,
  readOnly: PT.bool,
};

SwitchInput.defaultProps = {
  value: undefined,
  readOnly: false,
};

export default SwitchInput;
