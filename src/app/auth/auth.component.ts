import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LoadService } from '../load.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit, OnDestroy {
  mode = 0;
  loading = false;
  isAuth = true

  err?: string;

  show = false

  window = window

  viewPass = false

  signUpForm = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, Validators.required],
    confirmPass: [null, Validators.required],
  });

  signInForm = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, Validators.required],
  });

  passResetForm = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
  });

  constructor(
    private fb: UntypedFormBuilder,
    private loadService: LoadService,
    @Inject(PLATFORM_ID) private platformID: Object
  ) {}

  continue() {
    this.loading = true;
    this.beginAuth(async (result) => {
      this.loading = false;
      if (result.status) {
        let user = await this.loadService.currentUser;
        if (user) {
          this.loadService.openDash(user.uid);
        }
      } else {
        this.err = result.msg;
      }
    });
  }

  private beginAuth(
    callback: (result: { status: boolean; msg: string }) => any
  ) {
    var form: UntypedFormGroup;

    switch (this.mode) {
      case 0:
        form = this.signUpForm;

        let conditions0 = [
          {
            condition: (form.controls['password'].value.length ?? 0) >= 6,
            msg: 'Password not long enough',
          },
          {
            condition:
              form.controls['password'].value ==
              form.controls['confirmPass'].value,
            msg: 'Passwords do not match',
          },
        ];
        let isValid0 = this.validateForm(form, conditions0);

        if (isValid0.status) {
          this.handleSignUp(form, (result) => {
            callback(result);
          });
        } else {
          callback(isValid0);
        }
        return;
      case 1:
        form = this.signInForm;
        let conditions1 = [
          {
            condition: (form.controls['password'].value.length ?? 0) >= 6,
            msg: 'Invalid password',
          },
        ];
        let isValid1 = this.validateForm(form, conditions1);
        if (isValid1.status) {
          this.handleSignIn(form, (result) => {
            callback(result);
          });
        } else {
          callback(isValid1);
        }
        return;
      case 2:
        form = this.passResetForm;
        let isValid2 = this.validateForm(form);
        if (isValid2.status) {
          this.handlePassReset(form, (result) => {
            callback({ status: false, msg: 'Check your email for a link!' });
          });
        } else {
          callback(isValid2);
        }
        return;
      default:
        return;
    }
  }

  private validateForm(
    form: UntypedFormGroup,
    extra: { condition: boolean; msg: string }[] = []
  ) {
    let invalidConditions = extra.filter((val) => val.condition == false);
    if (form.valid && invalidConditions.length == 0) {
      return { status: true, msg: '' };
    } else {
      if (!form.valid) {
        return { status: false, msg: 'Missing required fields' };
      } else if (invalidConditions.length > 0) {
        return {
          status: false,
          msg: invalidConditions.map((c) => c.msg).join(', '),
        };
      }
      return { status: false, msg: 'Missing required fields' };
    }

    
  }

  private handleSignUp(
    form: UntypedFormGroup,
    callback: (result: { status: boolean; msg: string }) => any
  ) {
    let email = form.controls['email'].value;
    let password = form.controls['password'].value;

    this.loadService.finishSignUp(email, password, (result) => {
      callback(result);
    });
  }

  private handleSignIn(
    form: UntypedFormGroup,
    callback: (result: { status: boolean; msg: string }) => any
  ) {
    let email = form.controls['email'].value;
    let password = form.controls['password'].value;

    this.loadService.finishSignIn(email, password, (result) => {
      callback(result);
    });//
  }

  private handlePassReset(
    form: UntypedFormGroup,
    callback: (result: { status: boolean; msg: string }) => any
  ) {
    let email = form.controls['email'].value;
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformID)){
      window.onclick = null;
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformID)){
      window.onclick = (e) => {
        if (isPlatformBrowser(this.platformID)) {
          if ((e.target as any).id != 'continue') {
            this.err = undefined;
          }
        }
      };
  //     eval(`$.getScript("https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js", function(){
  //     particlesJS('particles-js',
  //     {
  //       "particles": {
  //         "number": {
  //           "value": 100,
  //           "density": {
  //             "enable": true,
  //             "value_area": 600
  //           }
  //         },
  //         "color": {
  //           "value": "#7F7F7F"
  //         },
  //         "shape": {
  //           "type": "image",
  //           "stroke": {
  //             "width": 0,
  //             "color": "#000000"
  //           },
  //           "polygon": {
  //             "nb_sides": 5
  //           },
  //           "image": {
  //             "width": 300,
  //             "height": 300,
  //             "src": "https://uploads-ssl.webflow.com/6426fa89f8155227fce2aee1/64573097d429e359ab92740a_S%20(12).png"
  //           }
  //         },
  //         "opacity": {
  //           "value": 0.8,
  //           "random": true,
  //           "anim": {
  //             "enable": true,
  //             "speed": 1,
  //             "opacity_min": 0.1,
  //             "sync": false
  //           }
  //         },
  //         "size": {
  //           "value": 5,
  //           "random": true,
  //           "anim": {
  //             "enable": false,
  //             "speed": 40,
  //             "size_min": 0.1,
  //             "sync": false
  //           }
  //         },
  //         "line_linked": {
  //           "enable": true,
  //           "distance": 150,
  //           "color": "#1F6EF6",
  //           "opacity": 0.1,
  //           "width": 1
  //         },
  //         "move": {
  //           "enable": true,
  //           "speed": 0.5,
  //           "direction": "none",
  //           "random": true,
  //           "straight": false,
  //           "bounce": true,
  //           "out_mode": "out",
  //           "attract": {
  //             "enable": false,
  //             "rotateX": 600,
  //             "rotateY": 1200
  //           }
  //         }
  //       },
  //       "interactivity": {
  //         "detect_on": "canvas",
  //         "events": {
  //           "onhover": {
  //             "enable": false,
  //             "mode": "repulse"
  //           },
  //           "onclick": {
  //             "enable": true,
  //             "mode": "repulse"
  //           },
  //           "resize": true
  //         },
  //         "modes": {
  //           "grab": {
  //             "distance": 400,
  //             "line_linked": {
  //               "opacity": 1
  //             }
  //           },
  //           "bubble": {
  //             "distance": 400,
  //             "size": 40,
  //             "duration": 2,
  //             "opacity": 8,
  //             "speed": 3
  //           },
  //           "repulse": {
  //             "distance": 100
  //           },
  //           "push": {
  //             "particles_nb": 4
  //           },
  //           "remove": {
  //             "particles_nb": 2
  //           }
  //         }
  //       },
  //       "retina_detect": true,
  //     }
  //     );
  
  // });`)
    }
    
  }
}
