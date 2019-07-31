import React from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import { createMuiTheme, makeStyles } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import LockIcon from '@material-ui/icons/Lock';

import { Notification, useTranslate, userLogin } from 'react-admin';

import { lightTheme } from './themes';

const useStyles = makeStyles(theme => ({
    main: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'flex-start',
        background: 'url(https://source.unsplash.com/random/1600x900)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
    },
    card: {
        minWidth: 300,
        marginTop: '6em',
    },
    avatar: {
        margin: '1em',
        display: 'flex',
        justifyContent: 'center',
    },
    icon: {
        backgroundColor: theme.palette.secondary.main,
    },
    hint: {
        marginTop: '1em',
        display: 'flex',
        justifyContent: 'center',
        color: theme.palette.grey[500],
    },
    form: {
        padding: '0 1em 1em 1em',
    },
    input: {
        marginTop: '1em',
    },
    actions: {
        padding: '0 1em 1em 1em',
    },
}));

const renderInput = ({
    meta: { touched, error } = {},
    input: { ...inputProps },
    ...props
}) => (
    <TextField
        error={!!(touched && error)}
        helperText={touched && error}
        {...inputProps}
        {...props}
        fullWidth
    />
);

const Login = ({ location }) => {
    const translate = useTranslate();
    const classes = useStyles();
    const dispatch = useDispatch();
    const isLoading = useSelector(state => state.admin.loading > 0);

    const login = auth =>
        dispatch(
            userLogin(auth, location.state ? location.state.nextPathname : '/')
        );

    const validate = (values, props) => {
        const errors = {};
        const { translate } = props;
        if (!values.username) {
            errors.username = translate('ra.validation.required');
        }
        if (!values.password) {
            errors.password = translate('ra.validation.required');
        }
        return errors;
    };

    return (
        <Form
            onSubmit={login}
            validate={validate}
            render={({ handleSubmit, submitting }) => (
                <form onSubmit={handleSubmit} noValidate>
                    <div className={classes.main}>
                        <Card className={classes.card}>
                            <div className={classes.avatar}>
                                <Avatar className={classes.icon}>
                                    <LockIcon />
                                </Avatar>
                            </div>
                            <form onSubmit={handleSubmit(login)}>
                                <div className={classes.hint}>
                                    Hint: demo / demo
                                </div>
                                <div className={classes.form}>
                                    <div className={classes.input}>
                                        <Field
                                            autoFocus
                                            name="username"
                                            component={renderInput}
                                            label={translate(
                                                'ra.auth.username'
                                            )}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className={classes.input}>
                                        <Field
                                            name="password"
                                            component={renderInput}
                                            label={translate(
                                                'ra.auth.password'
                                            )}
                                            type="password"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                <CardActions className={classes.actions}>
                                    <Button
                                        variant="contained"
                                        type="submit"
                                        color="primary"
                                        disabled={isLoading}
                                        className={classes.button}
                                        fullWidth
                                    >
                                        {isLoading && (
                                            <CircularProgress
                                                size={25}
                                                thickness={2}
                                            />
                                        )}
                                        {translate('ra.auth.sign_in')}
                                    </Button>
                                </CardActions>
                            </form>
                        </Card>
                        <Notification />
                    </div>
                </form>
            )}
        />
    );
};

Login.propTypes = {
    authProvider: PropTypes.func,
    previousRoute: PropTypes.string,
};

// We need to put the ThemeProvider decoration in another component
// Because otherwise the withStyles() HOC used in EnhancedLogin won't get
// the right theme
const LoginWithTheme = props => (
    <ThemeProvider theme={createMuiTheme(lightTheme)}>
        <Login {...props} />
    </ThemeProvider>
);

export default LoginWithTheme;
