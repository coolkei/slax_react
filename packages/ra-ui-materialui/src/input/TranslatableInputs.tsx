import * as React from 'react';
import { ReactElement, ReactNode } from 'react';
import {
    TranslatableContextProvider,
    useTranslatable,
    UseTranslatableOptions,
} from 'ra-core';
import { TranslatableInputsTabs } from './TranslatableInputsTabs';
import { TranslatableInputsTabContent } from './TranslatableInputsTabContent';
import { makeStyles } from '@material-ui/core/styles';

/**
 * Provides a way to edit multiple languages for any input passed as children.
 * It expects the translatable values to have the following structure:
 * {
 *     name: {
 *         en: 'The english value',
 *         fr: 'The french value',
 *         tlh: 'The klingon value',
 *     },
 *     description: {
 *         en: 'The english value',
 *         fr: 'The french value',
 *         tlh: 'The klingon value',
 *     }
 * }
 *
 * @example <caption>Basic usage</caption>
 * <TranslatableInputs locales={['en', 'fr']}>
 *     <TextInput source="title" />
 *     <RichTextInput source="description" />
 * </Translatable>
 *
 * @example <caption>With a custom language selector</caption>
 * <TranslatableInputs
 *     selector={<MyLanguageSelector />}
 *     locales={['en', 'fr']}
 * >
 *     <TextInput source="title" />
 * </Translatable>
 *
 * const MyLanguageSelector = () => {
 *     const {
 *         locales,
 *         selectedLocale,
 *         selectLocale,
 *     } = useTranslatableContext();
 *
 *     return (
 *         <select onChange={event => selectLocale(event.target.value)}>
 *             {locales.map((locale) => (
 *                 <option selected={locale === selectedLocale}>
 *                     {locale}
 *                 </option>
 *             ))}
 *        </select>
 *     );
 * }
 *
 * * @param props The component props
 * * @param {string} props.defaultLocale The locale selected by default. Default to 'en'.
 * * @param {string[]} props.locales An array of the possible locales. For example: `['en', 'fr'].
 * * @param {ReactElement} props.selector The element responsible for selecting a locale. Defaults to Material UI tabs.
 */
export const TranslatableInputs = (props: TranslatableProps): ReactElement => {
    const {
        defaultLocale,
        locales,
        groupKey = '',
        selector = <TranslatableInputsTabs groupKey={groupKey} />,
        children,
    } = props;
    const context = useTranslatable({ defaultLocale, locales });
    const classes = useStyles(props);

    return (
        <div className={classes.root}>
            <TranslatableContextProvider value={context}>
                {selector}
                {locales.map(locale => (
                    <TranslatableInputsTabContent
                        key={locale}
                        locale={locale}
                        groupKey={groupKey}
                    >
                        {children}
                    </TranslatableInputsTabContent>
                ))}
            </TranslatableContextProvider>
        </div>
    );
};

export interface TranslatableProps extends UseTranslatableOptions {
    selector?: ReactElement;
    children: ReactNode;
    groupKey?: string;
}

const useStyles = makeStyles(
    theme => ({
        root: {
            flexGrow: 1,
            backgroundColor: theme.palette.background.default,
        },
    }),
    {
        name: 'RaTranslatableInputs',
    }
);
