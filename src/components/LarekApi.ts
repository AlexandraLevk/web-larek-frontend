import { Api, ApiListResponse } from './base/Api';
import { IOrder, IOrderSuccess, IItem } from '../types';

export interface ILarekApi {
	getItemList: () => Promise<IItem[]>;
	orderItems: (order: IOrder) => Promise<IOrderSuccess>;
}

export class LarekApi extends Api implements ILarekApi {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string) {
		super(baseUrl);
		this.cdn = cdn;
	}

	getItemList(): Promise<IItem[]> {
		return this.get('/product').then((data: ApiListResponse<IItem>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}))
		);
	}

	orderItems(order: IOrder): Promise<IOrderSuccess> {
		return this.post('/order', order).then((data: IOrderSuccess) => data);
	}
}
