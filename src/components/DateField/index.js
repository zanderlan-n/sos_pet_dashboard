import React, { useCallback } from 'react';
import DatePicker, { registerLocale, setDefaultLocale } from 'react-datepicker';
import pt from 'date-fns/locale/pt';
import PT from 'prop-types';
import 'react-datepicker/dist/react-datepicker.css';
import { Input, FormGroup, Label, FormFeedback } from 'reactstrap';
import './styles.scss';

registerLocale('pt', pt);
setDefaultLocale('pt');

const CustomInput = ({ value, onClick, disabled, label, id, invalid, error }) => (
  <FormGroup>
    <Label htmlFor="date">
      { label ? label : 'Data'}
    </Label>
    <Input invalid={invalid} id={id} value={value} onClick={onClick} readOnly={disabled} />
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
);

const DateField = ({ value, onChange, disabled, label, id, invalid, error, ...props }) => {
  const handleChange = useCallback(
    (date) => {
      if (onChange) {
        onChange(date);
      }
    },
    [onChange]
  );

  return (
    <>
      <DatePicker
        className="w-100"
        style={{ width: '100%' }}
        customInput={<CustomInput error={error} id={id} label={label} value={value} disabled={disabled} invalid={invalid} />}
        selected={value ? new Date(value) : undefined}
        showTimeSelect={false}
        showPopperArrow={false}
        inputProps={{
          readOnly: true,
        }}
        timeFormat="HH:mm"
        timeIntervals={15}
        disabled={disabled}
        dateFormat="d 'de' MMMM 'de' yyyy"
        onChange={handleChange}
        {...props}
      />
    </>
  );
};

DateField.propTypes = {
  value: PT.oneOfType([PT.instanceOf(Date), PT.number]),
  onChange: PT.func.isRequired,
  disabled: PT.bool.isRequired,
};
DateField.defaultProps = {
  value: null,
};

export default React.memo(DateField);
