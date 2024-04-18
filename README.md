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
type ProductCategory = 'софт-скил' | 'другое' | 'дополнительное' | 'кнопка' | 'хард-скил';
```

Способы оплаты
```
type PaymentMethod = 'онлайн' | 'при получении';
```

Товар
```
interface IItem {
  id: string;
  title: string;
  description?: string;
  image: string;
  category: ProductCategory;
  price: number;
}
```

Хранение массива товаров
```
interface IItemsData {
  items: IItem[];
  preview: string | null;
}
```

Данные заказа
```
interface IOrder {
  payment: PaymentMethod;
  address: string;
  email: string;
  phone: string;
  items: IItem[]; 
  total: number;
}
```

Способ оплаты и данные покупателя в формах оформления заказа
```
type TOrderForm = Pick<IOrder, 'address' | 'email' | 'phone'>;
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

1. Класс ` Api ` — cодержит в себе базовую логику отправки запросов. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов:
```
constructor(baseUrl: string, options: RequestInit = {})
```
Методы:
- `get` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

2. Класс `EventEmitter` — брокер событий реализует паттерн «Наблюдатель» и позволяет подписываться на события и уведомлять подписчиков о наступлении события. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.\
Методы 
- `on`, `off`, `emit` — для подписки на событие, отписки от события и уведомления подписчиков о наступлении события.\
- `onAll` и `offAll` — для подписки на все события и сброса всех подписчиков.\
- `trigger` — генерирует заданное событие при вызове.

3. Класс `Component<T>` — абстрактный класс получает тип в виде дженерика. Конструктор принимает контейнер (HTML элемент), и возвращает корневой DOM-элемент методом render:
```
protected constructor(protected readonly container: HTMLElement)
```
Методы:
- `toggleClass(element: HTMLElement, className: string, force?: boolean)` - переключить класс
- `protected setText(element: HTMLElement, value: unknown)` - установить текстовое содержимое
- `setDisabled(element: HTMLElement, state: boolean)` - сменить статус блокировки
- `protected setHidden(element: HTMLElement)` - скрыть
- `protected setVisible(element: HTMLElement)` - показать
- ` protected setImage(element: HTMLImageElement, src: string, alt?: string)` - установить изображение с алтернативным текстом
- `render(data?: Partial<T>): HTMLElement` - вернуть корневой DOM-элемент


4. Класс `Model` — абстрактный класс слоя данных. Получает исходные данные, которые будут установлены в класс, и событие, чтобы уведомлять об изменении данных. 
Конструктор:
```
constructor(data: Partial<T>, protected events: IEvents)
```
- метод `emitChanges(event: string, payload?: object)` сообщает, что модель данных изменилась.



## Слой данных Data

### 1. Класс ```ItemsData```
Класс является дочерним от `Model` и отвечает за хранение массива товаров, полученных с сервера, и хранение айди открытой карточки товара.\

В полях класса хранятся следующие данные:
- `items: IItem[]` - массив объектов товаров
- `preview: string | null` - id товара, выбранного для просмотра в модальном окне

Методы:
- `getItem(itemId: string): IItem` - возвращает товар по id


### 2. Класс ```OrderData```
Класс является дочерним от `Model` и отвечает за хранение массива товаров, добавленных в корзину, данных покупателя и оформления покупки.\
В полях класса хранятся следующие данные:
- `id: string` - айди заказа
- `items: IItem[]` - массив товаров в корзине
- `total: number` - суммарная стоимость товаров в корзине
- `payment: PaymentMethod` - способ оплаты
- `address: string` - адрес доставки
- `email: string` - имэил покупателя
- `phone: string` - телефон покупателя

Методы: 
- `addItem(item: IItem): void` добавляет один товар в начало массива и вызывает событие изменения массива корзины
- `deleteItem(itemId: string, payload: Function | null = null): void` - удаляет товар из массива корзины. Если передан колбэк, то выполняет его после удаления, если нет, то вызывает событие изменения массива.
- `set total(total: number)` - подсчет и обновление суммарной стоимости товаров
- `set payment(payment: PaymentMethod)` - выбор способа оплаты
- `set address(value: string)`, `set phone(value: string)`,  `set email(value: string)` - сеттеры для сохранения данных покупателя в классе
- `checkValidation(data: Record<keyof TOrderForm, string>): boolean` проверка введенных покупателем данных на валидность


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


### 3. Родительский класс ```Card``` 
Наследует класс `Component`. Класс используется для отображения карточек на главной странице сайта, в модальном окне с подробным описанием товара, в корзине.\
В конструктор класса передается DOM элемент темплейта `constructor(container: HTMLElement)`, возвращает карточки разных вариантов верстки.\
Поля класса содержат элементы разметки элементов карточки и опционально кнопку. 
Сеттеры и геттеры для всех свойств:
- `set/get id(value: string)`
- `set/get title(value: string)`
- `set image(value: string)`
- `set description(value: string)`
- `set category(value: ProductCategory)`
- `set/get price(value: number)`
Конструктор, кроме темплейта принимает экземпляр `EventEmitter` для инициации событий.\

### 4. Класс ```Page``` 
Наследует класс `Component`. Отображает массив товаров и счетчик корзины.\
Конструктор класса принимает инстант брокера событий для инициации событий при нажатии пользователем на иконку корзины или карточку товара `constructor(container: HTMLElement, protected events: IEvents)`.\
Свойства и сеттеры класса:
- `protected _counter: HTMLElement` - счетчик корзины
- `protected _catalog: HTMLElement` - каталог товаров
- `protected _wrapper: HTMLElement` - обертка всей страницы
- `protected _basket: HTMLElement` - иконка корзины
- `set counter(value: number)`
- `set catalog(items: HTMLElement[])`
- `set locked(value: boolean)` - блокировка страницы при открытии модальных окон 


### 5. Класс ```BasketView``` 
Наследует класс `Component`. Отображает корзину - список товаров, суммарную стоимость, иконки удаления товаров из корзины, кнопка оформления заказа

Свойства и методы класса:
- `protected _list: HTMLElement` - список товаров в корзине
- `protected _deleteButton: HTMLElement` - кнопка удаления товара из корзины
- `protected _total: HTMLElement` - суммарная стоимость
- `protected _button: HTMLElement` - кнопка перехода к оформлению
- `set items(items: HTMLElement[])`
- `set total(value: number)` 
- `toggleButton(isActive: boolean)` - переключение кнопки "Добавить/Удалить"


### 6. Класс ```DeliveryForm``` 
Наследует класс ```Form```. Отображает форму с выбором способа оплаты и заполнением адреса доставки.\
Свойства и методы класса:
- `set payment(value: PaymentMethod)`
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
- `set total(value: number)`


## Слой коммуникации

### Класс AppApi
Принимает в конструктор экземпляр класса Api и предоставляет методы реализующие взаимодействие с бэкендом сервиса.

## Взаимодействие компонентов
Код, описывающий взаимодействие представления и данных между собой находится в файле `index.ts`, выполняющем роль презентера.\
Взаимодействие осуществляется за счет событий генерируемых с помощью брокера событий и обработчиков этих событий, описанных в `index.ts`\
В `index.ts` сначала создаются экземпляры всех необходимых классов, а затем настраивается обработка событий.

*Список всех событий, которые могут генерироваться в системе:*\
1. События изменения данных (генерируются классами моделями данных)
- `items:changed` - изменение массива товаров (загрузка с сервера)
- `card:selected` - изменение открываемой в модальном окне карточки товара
- `card:previewClear` - необходима очистка данных выбранной для показа в модальном окне карточки товара

2. События, возникающие при взаимодействии пользователя с интерфейсом (генерируются классами, отвечающими за представление)
- `card:select` - выбор карточки товара для отображения в модальном окне
- `item:add` - добавления товара в корзину
- `item:delete` - удаление товара из корзины
- `basket:open` - открытие корзины
- `basket:submit` - переход к оформлению списка покупок
- `payment:select` - выбор способа оплаты
- `edit-adress:input` - изменение адреса в форме доставки 
- `delivery-form:submit` - сохранение данных оплаты и доставки в модальном окне
- `edit-userinfo:input` - изменение данных покупателя(имейл и телефон) в модальном окне
- `edit-userinfo:submit` - сохранение данных покупателя (имейл и телефон) в модальном окне
- `order-success:submit` - сохранение данных успешной покупки
- `edit-adress:validation` - событие, сообщающее о необходимости валидации адреса покупателя
- `edit-userinfo:validation` - событие, сообщающее о необходимости валидации формы с данными покупателя