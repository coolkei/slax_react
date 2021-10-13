import * as React from 'react';
import { useEffect } from 'react';
import { renderWithRedux } from 'ra-test';
import { useNotify } from './index';

const Notification = ({
    type,
    message,
    undoable = false,
    autoHideDuration = 4000,
    multiLine = false,
    shortSignature = false,
}) => {
    const notify = useNotify();
    useEffect(() => {
        if (shortSignature) {
            notify(message, {
                type,
                undoable,
                autoHideDuration,
            });
        } else {
            notify(message, type, {}, undoable, autoHideDuration);
        }
    }, [
        message,
        undoable,
        autoHideDuration,
        shortSignature,
        shortSignature,
        type,
        notify,
    ]);
    return null;
};

describe('useNotify', () => {
    it('should show a multiline notification message', () => {
        const { dispatch } = renderWithRedux(
            <Notification
                type="info"
                message={`One Line\nTwo Lines\nThree Lines`}
                multiLine
            />
        );

        expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it('should show a notification message of type "warning"', () => {
        const { dispatch } = renderWithRedux(
            <Notification
                type="warning"
                message="Notification message"
                autoHideDuration={4000}
                shortSignature
            />
        );

        expect(dispatch).toHaveBeenCalledTimes(1);
    });
});
