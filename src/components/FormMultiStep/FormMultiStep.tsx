/**
 * Component FormMultiStep
 */

import * as React from 'react';
import * as classnames from 'classnames';
import {
	FormStep,
	InputControlText,
	InputControlSelectRadio,
	InputControlTextProps,
	InputControlSelectRadioProps,
	InputControlSubmitProps,
	InputControlSubmit,
	FormControls,
	FormSuccess,
	Button,
} from '..';
import './FormMultiStep.scss';

export type FormMultiStepAllowedTypes =
	| InputControlTextProps
	| InputControlSelectRadioProps
	| InputControlSubmitProps;

export type FormMultiStepSchema = {
	[key: number]: FormMultiStepAllowedTypes;
};

export interface FormMultiStepProps {
	id: string;
	className?: string;
	formSchema: object;
	formData?: object;
	onChange: (state: State) => void;
}

interface State {
	currentStep: number;
	complete: boolean;
	form: object;
	errors: object;
}

const makeDefaultFormData = (formSchema: object): object => {
	let nextFormData = {};
	Object.values(formSchema).map(field => {
		switch (field.type) {
			case 'submit':
				return (nextFormData[field.name] = false);
			case 'radio':
			case 'text':
			case 'email':
			default:
				return (nextFormData[field.name] = '');
		}
	});
	return nextFormData;
};

const prepareFormData = (formData?: object): object | undefined => {
	if (formData && !formData.hasOwnProperty('submit')) {
		return { ...formData, submit: false };
	}
	return formData || undefined;
};

const initialState = (formSchema: object, formData?: object): State => {
	return {
		currentStep: 1,
		complete: false,
		form: prepareFormData(formData) || makeDefaultFormData(formSchema) || {},
		errors: {},
	};
};

const validateEmail = (value: string): boolean =>
	/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
		`${value}`
	);

const getValidationMessage = (current: object, state: State) => {
	switch (current['type']) {
		case 'radio':
			return 'You need to select one item';
		case 'email':
			return 'Email is required';
		case 'text':
		default:
			return 'This field is required';
	}
};

export class FormMultiStep extends React.Component<FormMultiStepProps, State> {
	state: State = initialState(this.props.formSchema, this.props.formData);

	gotoPrevStep = (): void => {
		this.setState(state => ({
			...state,
			complete: false,
			currentStep: state.currentStep > 1 ? state.currentStep - 1 : 1,
		}));
	};

	gotoNextStep = (): void => {
		const maxSteps = Object.keys(this.state.form).length;
		const current = this.props.formSchema[this.state.currentStep];
		if (this.validateInput(current)) {
			this.setState(state => ({
				...state,
				complete: false,
				currentStep: state.currentStep < maxSteps ? state.currentStep + 1 : maxSteps,
			}));
		}
	};

	gotoStep = (step: number): void => {
		const maxSteps = Object.keys(this.state.form).length;
		this.setState(state => ({
			...state,
			complete: false,
			currentStep: step > 0 ? (step < maxSteps ? step : maxSteps) : 1,
		}));
	};

	validateInput = (current: FormMultiStepAllowedTypes) => {
		const hasErrors = this.state.form[current.name] === '';
		const invalidEmail =
			current['type'] === 'email' && !validateEmail(this.state.form[current.name]);

		if (hasErrors || invalidEmail) {
			return this.setState(state => ({
				...state,
				errors: {
					...this.state.errors,
					[current.name]:
						(hasErrors && getValidationMessage(current, this.state)) ||
						(invalidEmail && 'Email is not valid') ||
						'Something went wrong',
				},
			}));
		}
		return true;
	};

	handleFormSubmit = (form: React.FormEvent<HTMLFormElement>): void => {
		form.preventDefault();
		this.gotoNextStep();
		this.props.onChange(this.state);
	};

	handleInputChange = (name: string, value: string): void => {
		this.setState(
			state => ({
				...state,
				errors: {},
				form: {
					...state.form,
					[name]: value,
				},
			}),
			() => this.props.onChange(this.state)
		);
	};

	handleFormComplete = (): void => {
		this.setState(state => ({
			...state,
			complete: true,
		}));
		this.props.onChange(this.state);
	};

	resetForm = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		this.setState(initialState(this.props.formSchema, this.props.formData), () =>
			this.props.onChange(this.state)
		);
	};

	render(): JSX.Element {
		const { id, className, formSchema } = this.props;
		const { form, currentStep, complete } = this.state;
		const formStepData = formSchema[currentStep];
		const maxSteps = Object.keys(form).length;
		const hasErrors = this.state.errors[formStepData.name];

		return (
			<div id={`form-multi-step-${id}`} className={classnames('form-multi-step', className)}>
				{complete && <FormSuccess onReset={event => this.resetForm(event)} />}
				{!complete && (
					<>
						<FormControls
							maxSteps={maxSteps}
							currentStep={currentStep}
							onBack={() => this.gotoPrevStep()}
						/>
						<FormStep
							key={currentStep}
							id={`form-step-${currentStep}`}
							onSubmit={formData => this.handleFormSubmit(formData)}
						>
							{formStepData.type === 'radio' && (
								<InputControlSelectRadio
									id={formStepData.id}
									required={formStepData.required}
									name={formStepData.name}
									label={formStepData.label}
									values={formStepData.values}
									info={formStepData.info}
									status={formStepData.status}
									errors={hasErrors}
									defaultChecked={
										(formStepData.values.includes(form[formStepData.name]) &&
											form[formStepData.name]) ||
										(formStepData.defaultChecked !== false &&
											formStepData.values[0])
									}
									onChange={(name, event) =>
										this.handleInputChange(name, event.target.value)
									}
								/>
							)}
							{(formStepData.type === 'text' || formStepData.type === 'email') && (
								<InputControlText
									id={formStepData.id}
									required={formStepData.required}
									name={formStepData.name}
									label={formStepData.label}
									type={formStepData.type}
									value={form[formStepData.name]}
									info={formStepData.info}
									errors={hasErrors}
									status={formStepData.status}
									onChange={(name, event) =>
										this.handleInputChange(name, event.target.value)
									}
								/>
							)}
							{formStepData.type === 'submit' && (
								<InputControlSubmit
									id={formStepData.id}
									required={formStepData.required}
									name={formStepData.name}
									label={formStepData.label}
									value={formStepData.value}
									info={formStepData.info}
									status={formStepData.status}
									formValues={form}
									errors={hasErrors}
									onClick={() => this.handleFormComplete()}
									gotoStep={step => this.gotoStep(step)}
								/>
							)}
							{formStepData.type !== 'submit' && (
								<Button
									size="large"
									className="form-multi-step__next"
									type={(currentStep === maxSteps && 'disabled') || 'secondary'}
									onClick={() => this.gotoNextStep()}
								>
									Next
								</Button>
							)}
						</FormStep>
					</>
				)}
			</div>
		);
	}
}
