import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  async post(url: string, headers: any, data: any, params: any) {
    let response = await axios.post(url, data, {
      headers,
      params,
    });
    return response.data;
  }

  async get(url: string, headers: any, params: any) {
    let response = await axios.get(url, {
      headers,
      params,
    });
    return response.data;
  }

  async put(url: string, headers: any, data: any, params: any) {
    let response = await axios.put(url, data, {
      headers,
      params,
    });
    return response.data;
  }

  async remove(url: string, headers: any, params: any) {
    let response = await axios.delete(url, {
      headers,
      params,
    });
    return response.data;
  }
}
