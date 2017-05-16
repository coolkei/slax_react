import assert from 'assert';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { SaveButton } from './SaveButton';

const translate = (label) => label;

describe('<SaveButton />', () => {
    it('should render <RaisedButton /> when raised is true', () => {
        const wrapper = shallow(
            <SaveButton raised={true} translate={translate} />
        );

        assert.equal(wrapper.type().muiName, 'RaisedButton');
    });

    it('should render <FlatButton /> when raised is false', () => {
        const wrapper = shallow(
            <SaveButton raised={false} translate={translate} />
        );

        assert.equal(wrapper.type().muiName, 'FlatButton');
    });

    it('should render as submit type when submitOnEnter is true', () => {
        const raisedButtonWrapper = shallow(
            <SaveButton raised={true} submitOnEnter={true} translate={translate} />
        );
        const flatButtonWrapper = shallow(
            <SaveButton raised={false} submitOnEnter={true} translate={translate} />
        );

        assert.equal(raisedButtonWrapper.prop('type'), 'submit');
        assert.equal(flatButtonWrapper.prop('type'), 'submit');
    });

    it('should not call handleSubmit when clicked while submitOnEnter is true and no saving in in progress', () => {
        const handleSubmit = sinon.spy();
        const raisedButtonWrapper = shallow(
            <SaveButton raised={true} submitOnEnter={true} translate={translate} handleSubmit={handleSubmit} saving={false} />
        );
        const flatButtonWrapper = shallow(
            <SaveButton raised={false} submitOnEnter={true} translate={translate} handleSubmit={handleSubmit} saving={false} />
        );

        raisedButtonWrapper.simulate('click');
        flatButtonWrapper.simulate('click');

        assert(handleSubmit.notCalled);
    });

    it('should call handleSubmit when clicked while submitOnEnter is false and no saving is in progress', () => {
        const handleSubmit = sinon.spy();
        const raisedButtonWrapper = shallow(
            <SaveButton raised={true} submitOnEnter={false} translate={translate} handleSubmit={handleSubmit} saving={false} />
        );
        const flatButtonWrapper = shallow(
            <SaveButton raised={false} submitOnEnter={false} translate={translate} handleSubmit={handleSubmit} saving={false} />
        );

        raisedButtonWrapper.simulate('click');
        assert(handleSubmit.calledOnce);
        flatButtonWrapper.simulate('click');
        assert(handleSubmit.calledTwice);
    });

    it('should not call handleSubmit when clicked while submitOnEnter is false and saving is in progress', () => {
        const handleSubmit = sinon.spy();
        const event = {
          preventDefault: sinon.spy(),
        };

        const raisedButtonWrapper = shallow(
            <SaveButton raised={true} submitOnEnter={false} translate={translate} handleSubmit={handleSubmit} saving={true} />
        );
        const flatButtonWrapper = shallow(
            <SaveButton raised={false} submitOnEnter={false} translate={translate} handleSubmit={handleSubmit} saving={true} />
        );

        raisedButtonWrapper.simulate('click', event);
        assert(event.preventDefault.calledOnce);
        flatButtonWrapper.simulate('click', event);
        assert(event.preventDefault.calledTwice);

        assert(handleSubmit.notCalled);
    });
});
