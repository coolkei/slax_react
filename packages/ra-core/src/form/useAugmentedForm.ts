import { BaseSyntheticEvent, useCallback, useMemo, useEffect } from 'react';
import { FieldValues, useForm, UseFormProps } from 'react-hook-form';

import { RaRecord } from '../types';
import { useSaveContext } from '../controller';
import { useRecordContext } from '../controller';
import getFormInitialValues from './getFormInitialValues';
import {
    getSimpleValidationResolver,
    ValidateForm,
} from './getSimpleValidationResolver';
import { setSubmissionErrors } from './setSubmissionErrors';
import { useNotifyIsFormInvalid } from './useNotifyIsFormInvalid';
import { useWarnWhenUnsavedChanges } from './useWarnWhenUnsavedChanges';

/**
 * Wrapper around react-hook-form's useForm
 *
 * This hook adds the following features to react-hook-form's useForm:
 *
 * - form initialization based on RecordContext
 * - validation based on a validate function
 * - notification on invalid form
 * - stop form submission event propagation
 */
export const useAugmentedForm = (props: UseAugmentedFormProps) => {
    const {
        context,
        criteriaMode = 'firstError',
        defaultValues,
        delayError,
        formRootPathname,
        mode,
        resolver,
        reValidateMode = 'onChange',
        onSubmit,
        shouldFocusError,
        shouldUnregister,
        shouldUseNativeValidation,
        warnWhenUnsavedChanges,
        validate,
    } = props;
    const record = useRecordContext(props);
    const saveContext = useSaveContext();

    const defaultValuesIncludingRecord = useMemo(
        () => getFormInitialValues(defaultValues, record),
        [JSON.stringify({ defaultValues: typeof defaultValues === 'function' ? 'function' : defaultValues, record })] // eslint-disable-line
    );

    const finalResolver = resolver
        ? resolver
        : validate
        ? getSimpleValidationResolver(validate)
        : undefined;

    const form = useForm({
        context,
        criteriaMode,
        defaultValues: defaultValuesIncludingRecord,
        delayError,
        mode,
        reValidateMode,
        resolver: finalResolver,
        shouldFocusError,
        shouldUnregister,
        shouldUseNativeValidation,
    });

    // initialize form with record
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        if (!record) {
            return;
        }
        const initialValues = getFormInitialValues(defaultValues, record);
        form.reset(initialValues);
    }, [
        JSON.stringify({
            defaultValues:
                typeof defaultValues === 'function'
                    ? 'function'
                    : defaultValues,
            record,
        }),
    ]);
    /* eslint-enable react-hooks/exhaustive-deps */

    // notify on invalid form
    useNotifyIsFormInvalid(form.control);

    // warn when unsaved change
    useWarnWhenUnsavedChanges(
        Boolean(warnWhenUnsavedChanges),
        formRootPathname,
        form.control
    );

    // submit callbacks
    const handleSubmit = useCallback(
        async values => {
            let errors;

            if (onSubmit) {
                errors = await onSubmit(values);
            }
            if (onSubmit == null && saveContext?.save) {
                errors = await saveContext.save(values);
            }
            if (errors != null) {
                setSubmissionErrors(errors, form.setError);
            }
        },
        [form, onSubmit, saveContext]
    );

    const formHandleSubmit = useCallback(
        (event: BaseSyntheticEvent) => {
            if (!event.defaultPrevented) {
                // Prevent outer forms to receive the event
                event.stopPropagation();
                form.handleSubmit(handleSubmit)(event);
            }
            return;
        },
        [form, handleSubmit]
    );

    return {
        form,
        handleSubmit,
        formHandleSubmit,
    };
};

export type UseAugmentedFormProps = UseFormOwnProps &
    Omit<UseFormProps, 'onSubmit'> & {
        validate?: ValidateForm;
    };

export interface UseFormOwnProps {
    defaultValues?: any;
    formRootPathname?: string;
    record?: Partial<RaRecord>;
    onSubmit?: (data: FieldValues) => any | Promise<any>;
    warnWhenUnsavedChanges?: boolean;
}
