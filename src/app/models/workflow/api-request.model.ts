import { Dict } from 'src/app/load.service';
import { Request } from './request.model';

export class APIRequest extends Request {
  id!: string;

  constructor(
    id: string,
    method: 'POST' | 'GET' | 'PUT' | 'DELETE',
    url: string,
    headers: Dict<any> = {},
    body: Dict<any> = {},
    params: Dict<any> = {},
    responseFields: string,
    inputFields: string
  ) {
    super(method, url, headers, body, params, responseFields, inputFields);
    this.id = id;
  }
}
