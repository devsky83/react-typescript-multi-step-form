/**
 * Component InputControlSelectRadio
 */

import * as React from 'react';
import * as classnames from 'classnames';
import { InputControlRadio, InputControl, Label, Info } from '..';
import './InputControlSelectRadio.scss';

export interface Props {
	id: string;
	name: string;
	label?: string;
	values: string[];
	info?: string;
	value?: string;
	status?: 'success' | 'danger';
	required?: boolean;
	className?: boolean;
	defaultChecked?: string | boolean;
	errors?: string;
	onChange?: (name: string, event: React.ChangeEvent<HTMLInputElement>) => void;
}

export class InputControlSelectRadio extends React.Component<Props> {
	render(): JSX.Element {
		const {
			id,
			className,
			required,
			onChange,
			label,
			name,
			defaultChecked,
			info,
			status,
			values,
			errors,
		} = this.props;

		return (
			<InputControl
				id={id}
				type={'select-radio'}
				status={status}
				className={classnames(className)}
				errors={errors}
			>
				<Label className="input-control__label" htmlFor={id} label={label || ''} />
				<Info className="input-control__info" label={info || ''} />
				{errors && <Info className="input-control__errors" label={errors} />}
				<div className="input-control-select-radio__inputs">
					{values.map((item: string, index: number) => (
						<InputControlRadio
							id={`${id}-${index + 1}`}
							required={required}
							key={index}
							name={name}
							label={item}
							value={item || ''}
							defaultChecked={defaultChecked === item}
							onChange={(radio, event) => onChange && onChange(radio, event)}
						/>
					))}
				</div>
			</InputControl>
		);
	}
}
