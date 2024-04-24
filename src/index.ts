import './scss/styles.scss';

import { LarekApi } from './components/LarekApi';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { AppData } from './components/AppData'; //будет еще
import { Page } from './components/Page';
import { Card } from './components/Card';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Modal } from './components/common/Modal';
import { IItem, IOrderForm } from './types';
import { Basket } from './components/Basket';

import { OrderForm, ContactForm } from './components/Order';
import { Success } from './components/OrderSuccess';

const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const appData = new AppData(events);

// Контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new OrderForm(cloneTemplate(orderTemplate), events);
const contacts = new ContactForm(cloneTemplate(contactsTemplate), events);

// Изменились элементы каталога
events.on('items:changed', () => {
	page.catalog = appData.items.map((item) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:selected', item),
		});
		return card.render({
			title: item.title,
			image: item.image,
			category: item.category,
			price: item.price,
		});
	});
	page.counter = appData.getBasketItems().length;
});

// Открыть карточку товара
events.on('card:selected', (item: IItem) => {
	appData.setPreview(item);
});

// Изменен открытый товар
events.on('preview:changed', (item: IItem) => {
	const card = new Card(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			appData.inBasketStatus(item);
			events.emit('preview:changed', item);
		},
	});

	modal.render({
		content: card.render({
			title: item.title,
			image: item.image,
			category: item.category,
			price: item.price,
			description: item.description,
			inBasket: item.inBasket,
		}),
	});

	if (item.inBasket) {
		card.buttonText = 'Удалить';
	} else {
		card.buttonText = 'Купить';
	}
});

// Открыть корзину
events.on('basket:open', () => {
	basket.items = appData.getBasketItems().map((item, index) => {
		const card = new Card(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				appData.inBasketStatus(item); // поменяли свойство "в корзине / не в корзине"
				events.emit('basket:open');
			},
		});
		card.itemIndex = index + 1;
		return card.render({
			title: item.title,
			price: item.price,
		});
	});
	basket.total = appData.getTotal();
	modal.render({
		content: basket.render({}),
	});
});

//Изменения в корзине - добавлен или удален товар
events.on('basket:changed', () => {
	page.counter = appData.getBasketItems().length;
});

// Открыть форму заказа
events.on('order:open', () => {
	modal.render({
		content: order.render({
			payment: '',
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

// Выбор способа оплаты
events.on('payment:change', (data: { target: string }) => {
	appData.setPayment(data.target);
	console.log(appData.order);
});

// Изменился адрес доставки
events.on(
	/^order\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

// Изменилось одно из полей контактов
events.on(
	/^contacts\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

// Изменилось состояние валидации формы Доставки
events.on('orderFormErrors:change', (errors: Partial<IOrderForm>) => {
	const { payment, address } = errors;
	order.valid = !payment && !address;
	order.errors = Object.values({ payment, address })
		.filter((i) => !!i)
		.join('; ');
});

// Переход из формы Доставка в форму Контакты
events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			phone: '',
			email: '',
			valid: false,
			errors: [],
		}),
	});
});

// Изменилось состояние валидации формы Контактов
events.on('contactFormErrors:change', (errors: Partial<IOrderForm>) => {
	const { email, phone } = errors;
	contacts.valid = !email && !phone;
	contacts.errors = Object.values({ email, phone })
		.filter((i) => !!i)
		.join('; ');
});

// Отправлена форма заказа
events.on('contacts:submit', () => {
	appData.completeOrder();
	api
		.orderItems(appData.order)
		.then(() => {
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
					appData.clearBasket();
				},
			});
			success.total = appData.getTotal();
			modal.render({
				content: success.render({}),
			});
			appData.resetOrder();
			order.resetPaymentButton();
		})
		.catch((err) => {
			console.error(err);
		});
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});

// При закрытии модалки сбрасываем введенные в форму данные и разблокируем прокрутку страницы
events.on('modal:close', () => {
	page.locked = false;
	order.resetPaymentButton();
	appData.resetOrder();
});

// Получаем лоты с сервера
api
	.getItemList()
	.then(appData.setItemList.bind(appData))
	.catch((err) => {
		console.error(err);
	});
