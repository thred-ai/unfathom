import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss'],
})
export class SearchbarComponent implements OnInit {
  val?: any;

  @Input() set value(v: any) {
    this.val = v;
  }

  @Input() loadingSearch?: string

  @Input() placeholder: string = "Search"

  @Output() search = new EventEmitter<any>();

  beginSearch(value: any){
    this.loadingSearch = value
    this.search.emit(value)
  }
  
  ngOnInit(): void {}
}
