import React from 'react';
import PropTypes from 'prop-types';
import shouldUpdate from 'recompose/shouldUpdate';
import compose from 'recompose/compose';
import Button from 'material-ui/Button';
import ImageEye from 'material-ui-icons/RemoveRedEye';
import { withStyles } from 'material-ui/styles';
import classnames from 'classnames';

import Link from '../Link';
import linkToRecord from '../../util/linkToRecord';
import translate from '../../i18n/translate';
import Responsive from '../layout/Responsive';

const styles = {
    link: {
        display: 'inline-flex',
        alignItems: 'center',
        overflow: 'inherit',
    },
    label: {
        marginLeft: '0.5em',
    },
};

const ShowButton = ({
    basePath = '',
    className,
    classes = {},
    label = 'ra.action.show',
    record = {},
    translate,
    ...rest
}) => (
    <Button
        className={classnames(classes.link, className)}
        component={Link}
        color="primary"
        to={`${linkToRecord(basePath, record.id)}/show`}
        {...rest}
    >
        <ImageEye />
        <Responsive
            small={<span />}
            medium={
                <span className={classes.label}>
                    {label && translate(label)}
                </span>
            }
        />
    </Button>
);

ShowButton.propTypes = {
    basePath: PropTypes.string,
    className: PropTypes.string,
    classes: PropTypes.object,
    label: PropTypes.string,
    record: PropTypes.object,
    translate: PropTypes.func.isRequired,
};

const enhance = compose(
    translate,
    shouldUpdate(
        (props, nextProps) =>
            props.translate !== nextProps.translate ||
            (props.record &&
                nextProps.record &&
                props.record.id !== nextProps.record.id) ||
            props.basePath !== nextProps.basePath ||
            (props.record == null && nextProps.record != null)
    ),
    withStyles(styles)
);

export default enhance(ShowButton);
