import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Dict, LoadService } from '../load.service';
import { APIRequest } from '../models/workflow/api-request.model';

@Component({
  selector: 'app-api-editor',
  templateUrl: './api-editor.component.html',
  styleUrls: ['./api-editor.component.scss'],
})
export class ApiEditorComponent implements OnInit {
  api?: APIRequest;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private loadService: LoadService,
    public dialogRef: MatDialogRef<ApiEditorComponent>
  ) {
    this.api = data.api as APIRequest;
  }

  apiFieldChanged(data: string, field: 'headers' | 'body' | 'params') {
    try {
      this.rawFields[field] = JSON.parse(data);
    } catch (error) {
      console.log(error);
    }
  }

  save() {
    Object.keys(this.rawFields).forEach((key) => {
      this.api![key as 'headers' | 'body' | 'params'] = this.rawFields[key];
    });
    this.rawFields = {};
  }

  ngOnInit(): void {}

  newFields: Dict<Dict<any>> = { headers: {}, body: {}, params: {} };
  rawFields: Dict<Dict<any>> = {};

  APIDetails!: 'headers' | 'body' | 'params';

  requestTypes: Dict<{ name: string; fields: any[] }> = {
    POST: {
      name: 'POST',
      fields: [
        { name: 'Headers', id: 'headers', hasRaw: false },
        { name: 'Body', id: 'body', hasRaw: true },
        { name: 'Query Params', id: 'params', hasRaw: false },
      ],
    },
    GET: {
      name: 'GET',
      fields: [
        { name: 'Headers', id: 'headers', hasRaw: false },
        { name: 'Query Params', id: 'params', hasRaw: false },
      ],
    },
  };

  newDetail(
    field: 'headers' | 'body' | 'params',
    key?: string,
    value?: string
  ) {
    const map1 = new Map();

    Object.keys(this.api![field]).forEach((key, index) => {
      map1.set(key, this.api![field][key]);
    });

    let name =
      key ?? `Field ${(Object.keys(this.api![field]) as string[]).length + 1}`;

    if (this.isNameTaken(field, name)) {
      var index = 1;
      do {
        index += 1;
        name = `Option ${
          (Object.keys(this.api![field]) as string[]).length + index
        }`;
      } while (this.isNameTaken(field, name));
    }
    map1.set(name, value ?? '');

    this.api![field] = Object.fromEntries(map1);
    this.newFields[field] = {};
  }

  editDetail(
    field: 'headers' | 'body' | 'params',
    i: number,
    newKey?: string,
    newValue?: string
  ) {
    Object.keys(this.api![field]).forEach((key, index) => {
      if (index == i && newKey && !this.isNameTaken(field, newKey)) {
        // map1.set(newKey ?? key, newValue ?? this.api![field][key]);
        this.api![field][newKey] = this.api![field][key];
        delete this.api![field][key];
        return;
      } else if (index == i && newValue) {
        this.api![field][key] = newValue;
        return;
      }
    });
  }

  removeDetail(field: 'headers' | 'body' | 'params', removeKey: string) {
    const map1 = new Map();

    Object.keys(this.api![field]).forEach((key, index) => {
      if (key != removeKey) {
        map1.set(key, this.api![field][key]);
      }
    });
    this.api![field] = Object.fromEntries(map1);
  }

  logAPI() {
    console.log(this.api);
  }

  isNameTaken(field: 'headers' | 'body' | 'params', name: string) {
    if (this.api![field][name]) {
      return true;
    }
    return false;
  }

  sameRequest(id: string, req: string) {
    return this.requestTypes[req].fields.find((r) => r.id == id);
  }

  close() {
    this.dialogRef.close();
  }
}
