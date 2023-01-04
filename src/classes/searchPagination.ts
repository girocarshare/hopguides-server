import { FindOneOptions } from 'mongodb';
import { SortOrder } from './enums';

export class SearchPagination {
	pageSize: number = 15;
	page: number = 0;
	sortField: string;
	sortOrder: SortOrder = SortOrder.ASC;

	constructor(data?: any) {
		if (!data) return;
		this.pageSize = +data.pageSize || 15;
		this.page = +data.page || 0;
		this.sortField = data.sortField;
		this.sortOrder = data.sortOrder || SortOrder.ASC;
	}

	buildMongoSearchOptions(): FindOneOptions<any> {
		const options: any = {
			limit: this.pageSize,
			skip: this.page * this.pageSize
		};
		if (this.sortField)
			options.sort = { [this.sortField]: this.sortOrder === SortOrder.ASC ? 1 : -1 };

		return options;
	}

	buildSortStage(): any {
		return {
			$sort: {
				[this.sortField]: this.sortOrder === SortOrder.ASC ? 1 : -1
			}
		};
	}

	buildSkipStage(): any {
		return {
			$skip: this.page * this.pageSize
		};
	}

	buildLimitStage(): any {
		return {
			$limit: this.pageSize
		};
	}
}
