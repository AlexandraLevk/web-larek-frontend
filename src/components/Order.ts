import { Form } from './common/Form';
import { IOrderForm } from '../types';
import { IEvents } from './base/Events';

export class OrderForm extends Form<IOrderForm> {
	protected _cardButton: HTMLButtonElement;
	protected _cashButton: HTMLButtonElement;
	protected _address: HTMLInputElement;
	protected _payment: string = '';

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._cardButton = this.container.querySelector('[name=card]');
		this._cashButton = this.container.querySelector('[name=cash]');
		this._address = this.container.querySelector('[name=address]');

		if (this._cardButton && this._cashButton) {
			this._cardButton.addEventListener('click', () => {
				this.toggleCard();
				this.toggleCash(false);
				events.emit(`payment:change`, { target: 'card' });
			});
			this._cashButton.addEventListener('click', () => {
				this.toggleCard(false);
				this.toggleCash();
				events.emit(`payment:change`, { target: 'cash' });
			});
		}
	}

	resetPaymentButton() {
		this._cashButton.classList.remove('button_alt-active');
		this._cardButton.classList.remove('button_alt-active');
	}
	
	toggleCard(state: boolean = true) {
		this.toggleClass(this._cardButton, 'button_alt-active', state);
	}

	toggleCash(state: boolean = true) {
		this.toggleClass(this._cashButton, 'button_alt-active', state);
	}

	set address(value: string) {
		this._address.value =	value;
	}
}

export class ContactForm extends Form<IOrderForm> {
	protected _email: HTMLInputElement;
	protected _phone: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
		this._email = this.container.querySelector('[name=email]');
		this._phone = this.container.querySelector('[name=phone]');
	}

	set email(value: string) {
		this._email.value =	value;
	}

	set phone(value: string) {
		this._phone.value =	value;
	}
}
