import { NextFunction, Request, Response } from 'express';
import { User, UserRoles } from '../models/user/user';
import { CustomError } from './customError';

export interface MulterFile {
	/** Field name specified in the form */
	fieldname: string;
	/** Name of the file on the user's computer */
	originalname: string;
	/** Encoding type of the file */
	encoding: string;
	/** Mime type of the file */
	mimetype: string;
	/** Size of the file in bytes */
	size: number;
	/** The folder to which the file has been saved (DiskStorage) */
	destination: string;
	/** The name of the file within the destination (DiskStorage) */
	filename: string;
	/** Location of the uploaded file (DiskStorage) */
	path: string;
	/** A Buffer of the entire file (MemoryStorage) */
	buffer: Buffer;
	
	location: string;
}

export interface IRequest extends Request {
	file: MulterFile;
	files: MulterFile[];
	userId: string;
	role: UserRoles;
	token: string;
	name: string;
	locale?: string;
	bearerToken?: string;

	// boruts ~ inject system user from middleware as is already queried there
	user?: User;
}

export interface IResponse extends Response {
	respond: (status: number, data: Object, meta?: Object) => void;
	throwErr: (customError: CustomError) => void;
}

export interface INextFunction extends NextFunction {}
