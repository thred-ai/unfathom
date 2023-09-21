import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';

import { Dict, LoadService } from '../load.service';
import { Executable } from '../models/workflow/executable.model';
import { Scene } from '../models/workflow/scene.model';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit {
  @Input() workflow?: Executable;
  @Input() characterIds: any[] = [];
  characters: Dict<string> = {};

  isItemAvailable = false;
  items: any[] = [];

  getItems(ev: any) {
    // Reset items back to all of the items

    // set val to the value of the searchbar
    const val = ev.target.value ?? '';

    // if the value is an empty string don't filter the items
    if (val && val.trim() !== '') {
      this.isItemAvailable = true;
      this.searchCharacters(val);
    } else {
      this.isItemAvailable = false;
    }
  }

  searchCharacters(text: string) {
    if (this.workflow?.characters) {
      this.items = Object.values(this.workflow.characters).filter((c) =>
        c.name.toLowerCase().includes(text.toLowerCase())
      );
      if (this.items.length == 0) {
        this.isItemAvailable = false;
      }
    }
  }

  @Input() placeholder?: string = 'Search';
  @Output() characterChanged = new EventEmitter<string>();

  selectCharacter(value: any) {
    this.characterChanged.emit(value.id);
    setTimeout(() => {
      this.reloadCharacters()
    }, 50);
  }

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private loadService: LoadService
  ) {}

  ngOnInit() {
    console.log(this.characterIds);
    this.reloadCharacters();
  }

  reloadCharacters() {
    this.characterIds.forEach((c) => {
      this.characters[c.id] = c.id;
    });
  }
}
