# Проектная работа "Веб-ларек"

Реализация интернет-магазина с товарами для веб-разработчиков — Web-ларёк. В нём можно посмотреть каталог товаров, добавить товары в корзину и сделать заказ.

* Стек: HTML, SCSS, TS, Webpack

## Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

## Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```

## Сборка

```
npm run build
```

или

```
yarn build
```


## Данные и типы данных, используемые в приложении

Категории товаров
```
export type ProductCategory = 'софт-скил' | 'другое' | 'дополнительное' | 'кнопка' | 'хард-скил';
```

Товар
```
export interface IItem {
	id: string;
	description: string;
	image: string;
	title: string;
	category: ProductCategory;
	price: number | null;
	inBasket: boolean;
}
```

Модель данных приложения
```
export interface IAppData {
	items: IItem[];
	preview: string | null;
    order: IOrder;
    formErrors: FormErrors;
}
```

Данные в формах оформления заказа
```
export interface IOrderForm {
	payment: string;
	address: string;
	email: string;
	phone: string;
}
```

Данные заказа расширяют данные из форм
```
export interface IOrder extends IOrderForm {
	items: string[];
	total: number;
}
```

Ошибки при заполнении форм
```
export type FormErrors = Partial<Record<keyof IOrder, string>>;
```

Данные успешной покупки
```
interface IOrderSuccess {
  id: string;
  total: number;
}
```


## Архитектура приложения

Взаимодействия внутри приложения происходят через события. Модели инициализируют события, слушатели событий в основном коде выполняют передачу данных компонентам отображения, а также вычислениями между этой передачей, и еще они меняют значения в моделях.

Код приложения разделен на слои согласно парадигме MVP: 
- слой данных, отвечает за хранение и изменение данных,
- слой представления, отвечает за отображение данных на странице, 
- презентер, отвечает за связь представления и данных.


## Описание базовых классов

### 1. Класс ` Api ` 
Содержит в себе базовую логику отправки запросов. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов:
```
constructor(baseUrl: string, options: RequestInit = {})
```
Методы:
- `get` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

### 2. Класс `EventEmitter` 
Брокер событий реализует паттерн «Наблюдатель» и позволяет подписываться на события и уведомлять подписчиков о наступлении события. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.\
Методы 
- `on`, `off`, `emit` — для подписки на событие, отписки от события и уведомления подписчиков о наступлении события.\
- `onAll` и `offAll` — для подписки на все события и сброса всех подписчиков.\
- `trigger` — генерирует заданное событие при вызове.

### 3. Класс `Component<T>` 
Абстрактный класс получает тип в виде дженерика. Конструктор принимает контейнер (HTML элемент), и возвращает корневой DOM-элемент методом render:
```
protected constructor(protected readonly container: HTMLElement)
```
Методы:
- `toggleClass(element: HTMLElement, className: string, force?: boolean)` - переключить класс
- `protected setText(element: HTMLElement, value: unknown)` - установить текстовое содержимое
- `setDisabled(element: HTMLElement, state: boolean)` - сменить статус блокировки
- `protected setHidden(element: HTMLElement)` - скрыть
- `protected setVisible(element: HTMLElement)` - показать
- `protected setImage(element: HTMLImageElement, src: string, alt?: string)` - установить изображение с альтернативным текстом
- `render(data?: Partial<T>): HTMLElement` - вернуть корневой DOM-элемент



## Слой данных Data

### 1. Класс ```AppData```
Класс слоя данных отвечает за хранение массива товаров, полученных с сервера, хранение айди открытой карточки товара и информации о заказе. Реализует интерфейс `IAppData`\
Конструктор класса принимает инстант брокера событий `constructor(protected events: IEvents)`
В полях класса хранятся следующие данные:
- `items: IItem[]` - массив объектов товаров
- `preview: string | null` - id товара, выбранного для просмотра в модальном окне
-	`order: IOrder` - информация о заказе
-	`formErrors: FormErrors = {}`

Методы:
- `setItemList(items: IItem[]): void` - устанавливает список продуктов
- `setPreview(item: IItem): void` - устанавливает товар для просмотра в модалке
- `inBasketStatus(item: IItem): void` - меняетс статус товара "в корзине" / "не в корзине"
- `getBasketItems(): IItem[]` - возвращает массив товаров, добавленных в корзину
- `clearBasket(): void` - очищает корзину
- `getTotal(): number` - считает сумму товаров в корзине
- `setOrderField(field: keyof IOrderForm, value: string): void` - устанавливает значения из формы в поля заказа
- `setPayment(method: string): void` - устанавливает способ оплаты
- `validateOrder(): boolean` - валидация формы заказа
- `validateContacts(): boolean` - валидация формы контактов
- `completeOrder(): void` - устанавливает в заказ айди товаров и сумму покупки
- `resetOrder(): void` - сбрасывает поля заказа



## Слой отображения View

### 1. Родительский класс ```Modal``` 
Наследует класс `Component`. Устанавливает контент в модальное окно.\
 Конструктор класса принимает инстант брокера событий и устанавливает слушатели для закрытия модального окна по Esc, по клику в оверлей и по нажатию на кнопку-крестик:
```
constructor(container: HTMLElement, protected events: IEvents)
```
Свойства и методы класса:
- `protected _closeButton: HTMLButtonElement`
- `protected _content: HTMLElement`
- сеттер `set content(value: HTMLElement)` 
- методы: `open()`, `close()` и `render(data: IModalData): HTMLElement` 


### 2. Родительский класс ```Form<T>``` 
Класс получает тип в виде дженерика, наследует класс `Component`. Содержит кнопку отправки данных, элемент формы, элементы для вывода ошибок валидации под полями формы. При сабмите инициирует событие передавая в него объект с данными из полей ввода формы. Предоставляет методы для отображения ошибок и управления активностью кнопки "Далее". Конструктор:
```
constructor(protected container: HTMLFormElement, protected events: IEvents)
```
Свойства и методы класса:
- `protected _submit: HTMLButtonElement` - кнопка отправки формы
- `protected _errors: HTMLElement` -  элементы для вывода ошибок валидации под полями формы
- `protected onInputChange(field: keyof T, value: string)` - отслеживание вводимых данных
- сеттер `set valid(value: boolean)` - изменяет активность кнопки подтверждения
- сеттер `set errors(value: string)` - принимает данные для отображения текстов ошибок
- `render(state: Partial<T> & IFormState)` 


### 3. Класс ```Card``` 
Наследует класс `Component`. Класс используется для отображения карточек на главной странице сайта, в модальном окне с подробным описанием товара, в корзине.\
В конструктор класса передается DOM элемент темплейта и действия с карточкой `constructor(container: HTMLElement, actions?: ICardActions)`. Возвращает карточки разных вариантов верстки.\
Поля класса содержат элементы разметки элементов карточки и опционально кнопку. 
Сеттеры и геттеры для всех свойств:
- `set/get id(value: string)`
- `set/get title(value: string)`
- `set image(value: string)`
- `set description(value: string)`
- `set category(value: ProductCategory)`
- `set/get price(value: number)`
- `set buttonText(text: string)`
- `set itemIndex(value: number)`


### 4. Класс ```Page``` 
Наследует класс `Component`. Отображает массив товаров и счетчик корзины.\
В конструктор класса передается DOM элемент темплейта и инстант брокера событий для инициации событий при нажатии пользователем на иконку корзины или карточку товара `constructor(container: HTMLElement, protected events: IEvents)`.\
Свойства и сеттеры класса:
- `protected _counter: HTMLElement` - счетчик корзины
- `protected _catalog: HTMLElement` - каталог товаров
- `protected _wrapper: HTMLElement` - обертка всей страницы
- `protected _basket: HTMLElement` - иконка корзины
- `set counter(value: number)`
- `set catalog(items: HTMLElement[])`
- `set locked(value: boolean)` - блокировка страницы при открытии модальных окон 


### 5. Класс ```Basket``` 
Наследует класс `Component`. Отображает корзину - список товаров, суммарную стоимость, иконки удаления товаров из корзины, кнопка оформления заказа

Свойства и методы класса:
- `protected _list: HTMLElement` - список товаров в корзине
- `protected _total: HTMLElement` - суммарная стоимость
- `protected _button: HTMLElement` - кнопка перехода к оформлению
- `set items(items: HTMLElement[])`
- `set total(value: number)` 


### 6. Класс ```OrderForm``` 
Наследует класс ```Form```. Отображает форму с выбором способа оплаты и заполнением адреса доставки.\
Свойства и методы класса:
-	`protected _cardButton: HTMLButtonElement`
-	`protected _cashButton: HTMLButtonElement`
-	`protected _payment: string`
- `resetPaymentButton()`
- `set address(value: string)`


### 7. Класс ```ContactForm``` 
Наследует класс ```Form```. Отображает форму с полями для ввода данных покупателя.\
Свойства и методы класса:
- `set phone(value: string)`
- `set email(value: string)`


### 8. Класс ```OrderSuccess```
Наследует класс `Component`. Отображает сообщение об успешной покупке и сумму покупки.\
Свойства и методы класса:
- `protected _close: HTMLElement` - кнопка "на главную"
- `protected _total: HTMLElement` - сумма покупки
- `set total(total: number)`



## Слой коммуникации

### Класс LarekApi
Класс для работы с Api сервиса. Наследует базовый класс api.\
Конструктор: `constructor(cdn: string, baseUrl: string)` принимает адрес cdn и базовый url Api магазина.\
Предоставляет методы реализующие взаимодействие с бэкендом сервиса.

## Взаимодействие компонентов
Код, описывающий взаимодействие представления и данных между собой находится в файле `index.ts`, выполняющем роль презентера.\
Взаимодействие осуществляется за счет событий генерируемых с помощью брокера событий и обработчиков этих событий, описанных в `index.ts`\
В `index.ts` сначала создаются экземпляры всех необходимых классов, а затем настраивается обработка событий.

*Список всех событий, которые могут генерироваться в системе:*
1. События изменения данных (генерируются классами моделями данных)
- `items:changed` - изменение массива товаров (загрузка с сервера)
- `preview:changed` - в модели данных меняется товар для отображения в модальном окне
- `modal:open` - открытие модального окна
- `modal:close` - закрытие модального окна

2. События, возникающие при взаимодействии пользователя с интерфейсом (генерируются классами, отвечающими за представление)
- `card:selected` - изменение открываемой в модальном окне карточки товара
- `basket:open` - открытие корзины
- `basket:changed` - добавления/удаление товара в корзине
- `order:open` - открытие формы заказа
- `payment:change` - изменение способа оплаты
- `orderFormErrors:change` - валидация формы заказа
- `contactFormErrors:change` - валидация формы контактов
- `order:submit` - отправка формы заказа (переход к форме контактов)
- `contacts:submit` - отправка заказа целиком