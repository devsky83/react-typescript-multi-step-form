import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { InputGroupRadio } from './InputGroupRadio';
import { mount } from 'enzyme';

describe('InputGroupRadio', () => {
	const callback = jest.fn();
	const testData = {
		id: 'name',
		name: 'name',
		label: 'Your Name',
		value: 'Bob',
		onChange: callback,
	};

	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<InputGroupRadio {...testData} />, div);
		ReactDOM.unmountComponentAtNode(div);
	});

	it('change event works', () => {
		const wrapper = mount(<InputGroupRadio {...testData} />);
		wrapper.find('.input-group__input').simulate('change');
		expect(callback).toHaveBeenCalledTimes(1);
	});

	it('should adopt a valid info attribute', () => {
		const info = 'test';
		const wrapper = mount(<InputGroupRadio info={info} {...testData} />);
		expect(wrapper.find('.input-group__info').text()).toEqual('test');
	});
});
