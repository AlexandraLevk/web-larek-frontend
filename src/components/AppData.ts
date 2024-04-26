import { FormErrors, IAppData, IItem, IOrder, IOrderForm } from '../types';
import { IEvents } from './base/Events';


export class AppData implements IAppData {
	items: IItem[];
	preview: string | null;
	order: IOrder = {
		payment: '',
		email: '',
		phone: '',
		address: '',
		total: null,
		items: [],
	};
	formErrors: FormErrors = {};

	constructor(protected events: IEvents) {
		Object.assign(this);
	}

	setItemList(items: IItem[]): void {
		this.items = items;
		this.events.emit('items:changed');
	}

	setPreview(item: IItem): void {
		this.preview = item.id;
		this.events.emit('preview:changed', item);
	}

	inBasketStatus(item: IItem): void {
		item.inBasket ? (item.inBasket = false) : (item.inBasket = true);
		this.events.emit('basket:changed');
	}

	getBasketItems(): IItem[] {
		return this.items.filter((item) => item.inBasket === true);
	}

	clearBasket(): void {
		this.items.forEach((item) => {
			item.inBasket = false;
		});
		this.events.emit('basket:changed');
	}

	getTotal(): number {
		return this.getBasketItems().reduce(function (prevVal, item) {
			const total = prevVal + item.price;
			return total;
		}, 0);
	}

	setOrderField(field: keyof IOrderForm, value: string): void {
		this.order[field] = value;

		if (field === 'address' || field === 'payment') {
			this.validateOrder();
		}

		if (field === 'email' || field === 'phone') {
			this.validateContacts();
		}
	}

	setPayment(method: string): void {
		this.order.payment = method;
		this.validateOrder();
	}

	validateOrder(): boolean {
		const errors: FormErrors = {};

		if (!this.order.payment) {
			errors.payment = 'Необходимо указать способ оплаты';
		}
		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		}
		this.formErrors = errors;
		this.events.emit('orderFormErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	validateContacts(): boolean {
		const errors: FormErrors = {};
		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		this.formErrors = errors;
		this.events.emit('contactFormErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	completeOrder(): void {
		this.order.total = this.getTotal();
		this.order.items = this.getBasketItems()
			.filter((item) => item.price !== null)
			.map((item) => item.id);
	}

	resetOrder(): void {
		this.order = {
			payment: '',
			email: '',
			phone: '',
			address: '',
			total: 0,
			items: [],
		};
	}
}
