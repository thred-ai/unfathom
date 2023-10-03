import { Injectable } from '@angular/core';
import { Dict } from './load.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  theme = new BehaviorSubject<'light' | 'dark'>('light');


  themes: Dict<any> = {
    dark: {
      primaryColor: '#0C8CE9',
      secondaryColor: '#0A99FF',
      primaryTextColor: '#ffffff',
      secondaryTextColor: '#6c757d',
      primaryHoverColor: '#34aafe',
      sectionBackgroundColor: '#151515',
      primarySectionHoverColor: '#000000',
      secondarySectionHoverColor: '#2e2e2e5f',
      gridColor: '#242424',
      primaryBackgroundColor: '#2c2c2c',
      secondaryBackgroundColor: '#1e1e1e',
      borderColor: '#444444',
    },
    light: {
      primaryColor: '#0C8CE9',
      secondaryColor: '#F8F9FA',
      primaryTextColor: '#4f5a63',
      secondaryTextColor: '#bbbfc4',
      primaryHoverColor: '#34aafe',
      sectionBackgroundColor: '#e9eff4',
      primarySectionHoverColor: '#dee6ed',
      secondarySectionHoverColor: '#f2f2f2',
      gridColor: '#e6e6e6',
      primaryBackgroundColor: '#f8f9fa',
      secondaryBackgroundColor: '#f1f1f1',
      borderColor: '#e6e6e6',
    },
  };

  constructor() { 
    this.activeTheme = 'light';

    Object.keys(this.themes).forEach((theme) => {
      Object.keys(this.themes[theme]).forEach((colorKey) => {
        document.documentElement.style.setProperty(
          `--${theme}--${colorKey}`,
          `${this.themes[theme][colorKey]}`
        );
        console.log(`--${theme}--${colorKey}`)
      });
    });
  }

  set activeTheme(value: 'light' | 'dark') {

    Object.keys(this.themes[value]).forEach((colorKey) => {
      if (colorKey != 'gridColor') {
        document.documentElement.style.setProperty(
          `--${colorKey}`,
          `${this.themes[value][colorKey]}`
        );
      }
    });

    if (
      document.documentElement.style.getPropertyValue('--gridColor') !=
      'transparent'
    ) {
      document.documentElement.style.setProperty(
        '--gridColor',
        `${this.themes[value].gridColor}`
      );
    }
    //fix
    this.theme.next(value);
  }
}
