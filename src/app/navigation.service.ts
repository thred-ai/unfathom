import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  constructor(private router: Router) {}

  redirectTo(uri: string) {
    // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    //   console.log("oi f")
    //   this.router.navigate([uri]);
    // });

    this.router.navigate([uri]);

  }
}
