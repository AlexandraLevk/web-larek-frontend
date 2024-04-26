import { Component } from './base/Component';
import { createElement, ensureElement, formatNumber } from '../utils/utils';
import { IEvents } from './base/Events';

interface IBasket {
	list: HTMLElement;
	items: HTMLElement[];
	total: number;
	selected: string[];
}

export class Basket extends Component<IBasket> {
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLButtonElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._total = this.container.querySelector('.basket__price');
		this._button = this.container.querySelector('.basket__button');

		if (this._button) {
			this._button.addEventListener('click', () => {
				events.emit('order:open');
			});
		}

		this.items = [];
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			this.toggleButton(false);
			this._list.replaceChildren(...items);
		} else {
			this.toggleButton(true);
			this._list.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
		}
	}

	toggleButton(state: boolean) {
		this.setDisabled(this._button, state);
	}

	set total(total: number) {
		this.setText(this._total, `${formatNumber(total)} синапсов`);
		if (!total) {
			this.setDisabled(this._button, true);
		}
	}
}
