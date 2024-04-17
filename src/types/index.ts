export type ProductCategory = 'софт-скил' | 'другое' | 'дополнительное' | 'кнопка' | 'хард-скил';
export type PaymentMethod = 'онлайн' | 'при получении';

export interface IItem {
    id: string;
    description?: string;
    image: string;
    title: string;
    category: ProductCategory;
    price: number;
}

export interface IItemsData {
    items: IItem[];
    preview: string | null;
    getItem(itemId: string): IItem;
}

export interface IOrder {
    payment: PaymentMethod;
    address: string;
    email: string;
    phone: string;
    items: IItem[];
    total: number;    
}

export type TDeliveryForm = Pick<IOrder, 'payment' | 'address'>;

export type TContactForm = Pick<IOrder, 'email' | 'phone'>;

export interface IOrderSuccess {
    id: string;
    total: number;
}
