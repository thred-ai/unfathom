import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-coming-soon',
  templateUrl: './coming-soon.component.html',
  styleUrls: ['./coming-soon.component.scss']
})
export class ComingSoonComponent implements OnInit {

  
  @Input() title: string = "Coming Soon"
  @Input() message: string = "This feature will be coming soon"

  constructor() { }

  ngOnInit(): void {
  }

}
