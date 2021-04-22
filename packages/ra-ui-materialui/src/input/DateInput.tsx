import * as React from 'react';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import { useInput, FieldTitle, InputProps } from 'ra-core';

import sanitizeInputRestProps from './sanitizeInputRestProps';
import InputHelperText from './InputHelperText';

/**
 * Convert Date object to String
 *
 * @param {Date} value value to convert
 * @returns {String} A standardized date (yyyy-MM-dd), to be passed to an <input type="date" />
 */
const convertDateToString = (value: Date) => {
    if (!(value instanceof Date) || isNaN(value.getDate())) return '';
    const pad = '00';
    const yyyy = value.getFullYear().toString();
    const MM = (value.getMonth() + 1).toString();
    const dd = value.getDate().toString();
    return `${yyyy}-${(pad + MM).slice(-2)}-${(pad + dd).slice(-2)}`;
};

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const defaultInputLabelProps = { shrink: true };

const getStringFromDate = (value: string | Date) => {
    // null, undefined and empty string values should not go through dateFormatter
    // otherwise, it returns undefined and will make the input an uncontrolled one.
    if (value == null || value === '') {
        return '';
    }

    if (value instanceof Date) {
        return convertDateToString(value);
    }

    // valid dates should not be converted
    if (dateRegex.test(value)) {
        return value;
    }

    return convertDateToString(new Date(value));
};

const DateInput = ({
    defaultValue,
    format = getStringFromDate,
    initialValue,
    label,
    options,
    source,
    resource,
    helperText,
    margin = 'dense',
    onBlur,
    onChange,
    onFocus,
    parse,
    validate,
    variant = 'filled',
    ...rest
}: DateInputProps) => {
    const sanitizedDefaultValue = defaultValue
        ? format(new Date(defaultValue))
        : undefined;
    const sanitizedInitialValue = initialValue
        ? format(new Date(initialValue))
        : undefined;

    const { id, input, isRequired, meta } = useInput({
        defaultValue: sanitizedDefaultValue,
        format,
        formatOnBlur: true,
        initialValue: sanitizedInitialValue,
        onBlur,
        onChange,
        onFocus,
        parse,
        resource,
        source,
        validate,
        ...rest,
    });

    const { error, submitError, touched } = meta;

    // Workaround for https://github.com/final-form/react-final-form/issues/431
    useEffect(() => {
        // Checking for meta.initial allows the format function to work
        // on inputs inside an ArrayInput
        if (defaultValue || initialValue || meta.initial) {
            input.onBlur();
        }
    }, [input.onBlur, meta.initial]); // eslint-disable-line

    return (
        <TextField
            id={id}
            {...input}
            // Workaround https://github.com/final-form/react-final-form/issues/529
            value={input.value || ''}
            variant={variant}
            margin={margin}
            type="date"
            error={!!(touched && (error || submitError))}
            helperText={
                <InputHelperText
                    touched={touched}
                    error={error || submitError}
                    helperText={helperText}
                />
            }
            label={
                <FieldTitle
                    label={label}
                    source={source}
                    resource={resource}
                    isRequired={isRequired}
                />
            }
            InputLabelProps={defaultInputLabelProps}
            {...options}
            {...sanitizeInputRestProps(rest)}
        />
    );
};

DateInput.propTypes = {
    label: PropTypes.string,
    options: PropTypes.object,
    resource: PropTypes.string,
    source: PropTypes.string,
};

DateInput.defaultProps = {
    options: {},
};

export type DateInputProps = InputProps<TextFieldProps> &
    Omit<TextFieldProps, 'helperText' | 'label'>;

export default DateInput;
