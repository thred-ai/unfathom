import { Dict } from 'src/app/load.service';

export class Request {
  method!: 'POST' | 'GET' | 'PUT' | 'DELETE';
  url!: string;
  headers!: Dict<any>;
  body!: Dict<any>;
  params!: Dict<any>;
  responseFields!: string;
  inputFields!: string;

  constructor(
    method: 'POST' | 'GET' | 'PUT' | 'DELETE',
    url: string,
    headers: Dict<any> = {},
    body: Dict<any> = {},
    params: Dict<any> = {},
    responseFields: string,
    inputFields: string
  ) {
    this.method = method;
    this.url = url;
    this.headers = headers;
    this.body = body;
    this.params = params;
    this.responseFields = responseFields;
    this.inputFields = inputFields;
  }
}
