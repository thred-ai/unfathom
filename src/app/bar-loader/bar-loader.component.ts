import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-bar-loader',
  templateUrl: './bar-loader.component.html',
  styleUrls: ['./bar-loader.component.scss']
})
export class BarLoaderComponent implements OnInit {

  @Input() progress: number = 0
  @Input() total: number = 0

  ngOnInit(): void {
      
  }
}
