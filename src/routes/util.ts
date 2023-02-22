
import { INextFunction, IRequest, IResponse } from '../classes/interfaces';
import { CustomError } from '../classes/customError';

// todo : refactor all this
export function simpleAsync<
	TI = IRequest,
	TO extends IResponse = IResponse,
	TN extends INextFunction = INextFunction
>(routerFunction: (req: TI, res: TO) => Promise<any>) {
	return function (req: TI, res: TO, next: TN): any {
		routerFunction(req, res)
			.then(x => res.status(200).send(x))
			// todo : there are functions throwing and other functions using
			//        res.throwError(), all this stuff is not clear
			.catch(err => {
				if (err instanceof CustomError) res.throwErr(err);
				else next(err);
			});
	};
}

