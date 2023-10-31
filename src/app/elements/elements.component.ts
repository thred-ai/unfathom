import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-elements',
  templateUrl: './elements.component.html',
  styleUrls: ['./elements.component.scss']
})
export class ElementsComponent implements OnInit {

  selected = 0

  categories = [
    {
      id: 'assets',
      name: 'Models'
    },
    {
      id: 'materials',
      name: 'Materials'
    },
    {
      id: 'substance',
      name: 'Substances'
    },
    {
      id: 'skies',
      name: 'Skies'
    },
   
  ]
  ngOnInit(): void {
      
  }
}
