import { Router } from 'express';

export class BaseRouter {
	router: Router;

	constructor(mergeParams?: boolean) {
		if (!mergeParams) mergeParams = false;
		this.router = Router({ mergeParams: mergeParams });
	}
}
