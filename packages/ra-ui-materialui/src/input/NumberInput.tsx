import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { useInput, FieldTitle } from 'ra-core';

import { CommonInputProps } from './CommonInputProps';
import { InputHelperText } from './InputHelperText';
import { sanitizeInputRestProps } from './sanitizeInputRestProps';

/**
 * An Input component for a number
 *
 * Due to limitations in React controlled components and number formatting,
 * this input only updates the form value on blur.
 *
 * @example
 * <NumberInput source="nb_views" />
 *
 * You can customize the `step` props (which defaults to "any")
 * @example
 * <NumberInput source="nb_views" step={1} />
 *
 */
export const NumberInput = ({
    className,
    defaultValue = null,
    format = convertNumberToString,
    helperText,
    label,
    margin,
    onBlur,
    onChange,
    parse,
    resource,
    source,
    step,
    min,
    max,
    validate,
    variant,
    inputProps: overrideInputProps,
    ...rest
}: NumberInputProps) => {
    const {
        field,
        fieldState: { error, invalid, isTouched },
        formState: { isSubmitted },
        id,
        isRequired,
    } = useInput({
        defaultValue,
        resource,
        source,
        validate,
        ...rest,
    });

    const inputProps = { ...overrideInputProps, step, min, max };

    // This is a controlled input that doesn't transform the user input on change.
    // The user input is only turned into a number on blur.
    // This is to allow transitory values like '1.0' that will lead to '1.02'

    // text typed by the user and displayed in the input, unparsed
    const [value, setValue] = React.useState(format(field.value));

    // update the input text when the record changes
    React.useEffect(() => {
        const stringValue = format(field.value);
        setValue(value => (value !== stringValue ? stringValue : value));
    }, [field.value]); // eslint-disable-line react-hooks/exhaustive-deps

    // update the input text when the user types in the input
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(event);
        }
        if (
            typeof event.target === 'undefined' ||
            typeof event.target.value === 'undefined'
        ) {
            return;
        }
        setValue(event.target.value);
    };

    // set the numeric value on the form on blur
    const handleBlur = (...event: any[]) => {
        if (onBlur) {
            onBlur(...event);
        }
        const eventParam = event[0] as React.FocusEvent<HTMLInputElement>;
        if (
            typeof eventParam.target === 'undefined' ||
            typeof eventParam.target.value === 'undefined'
        ) {
            return;
        }
        const target = eventParam.target;
        const newValue = target.valueAsNumber
            ? parse
                ? parse(target.valueAsNumber)
                : target.valueAsNumber
            : parse
            ? parse(target.value)
            : convertStringToNumber(target.value);
        field.onChange(newValue);
        field.onBlur();
    };

    const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleBlur(event);
        }
    };

    return (
        <TextField
            id={id}
            {...field}
            // override the react-hook-form value, onChange and onBlur props
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyUp={handleKeyUp}
            className={clsx('ra-input', `ra-input-${source}`, className)}
            type="number"
            size="small"
            variant={variant}
            error={(isTouched || isSubmitted) && invalid}
            helperText={
                <InputHelperText
                    touched={isTouched || isSubmitted}
                    error={error?.message}
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
            margin={margin}
            inputProps={inputProps}
            {...sanitizeInputRestProps(rest)}
        />
    );
};

NumberInput.propTypes = {
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    options: PropTypes.object,
    resource: PropTypes.string,
    source: PropTypes.string,
    step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

NumberInput.defaultProps = {
    options: {},
    step: 'any',
    textAlign: 'right',
};

export interface NumberInputProps
    extends CommonInputProps,
        Omit<
            TextFieldProps,
            | 'label'
            | 'helperText'
            | 'defaultValue'
            | 'onChange'
            | 'onBlur'
            | 'type'
        > {
    step?: string | number;
    min?: string | number;
    max?: string | number;
}

const convertStringToNumber = value => {
    if (value == null || value === '') {
        return null;
    }
    const float = parseFloat(value);

    return isNaN(float) ? 0 : float;
};

const convertNumberToString = value =>
    value == null || isNaN(value) ? '' : value.toString();
