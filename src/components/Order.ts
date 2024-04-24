import { Form } from './common/Form';
import { IOrderForm } from '../types';
import { IEvents } from './base/events';

export class OrderForm extends Form<IOrderForm> {
	protected _cardButton: HTMLButtonElement;
	protected _cashButton: HTMLButtonElement;
	protected _payment: string = '';

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._cardButton = this.container.querySelector('[name=card]');
		this._cashButton = this.container.querySelector('[name=cash]');

		if (this._cardButton && this._cashButton) {
			this._cardButton.addEventListener('click', () => {
				this._cardButton.classList.add('button_alt-active');
				this._cashButton.classList.remove('button_alt-active');
				events.emit(`payment:change`, { target: 'card' });
			});
			this._cashButton.addEventListener('click', () => {
				this._cashButton.classList.add('button_alt-active');
				this._cardButton.classList.remove('button_alt-active');
				events.emit(`payment:change`, { target: 'cash' });
			});
		}
	}

	resetPaymentButton() {
		this._cashButton.classList.remove('button_alt-active');
		this._cardButton.classList.remove('button_alt-active');
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}
}

export class ContactForm extends Form<IOrderForm> {
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}

	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}
}
