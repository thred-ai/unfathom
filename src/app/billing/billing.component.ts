import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  StripeCardElementOptions,
  StripeElementsOptions,
} from '@stripe/stripe-js';
import { StripeCardComponent, StripeService } from 'ngx-stripe';
import { LoadService } from '../load.service';
// const yourhandle = require('countrycitystatejson');

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss'],
})
export class BillingComponent implements OnInit {
  @ViewChild(StripeCardComponent) card?: StripeCardComponent;

  @Output() cardAdded = new EventEmitter<any>();

  cardOptions: StripeCardElementOptions = {
    hidePostalCode: true,
    style: {
      base: {
        iconColor: '#06415F',
        color: '#051113',
        fontWeight: 'regular',
        fontFamily: 'Arial',
        fontSize: '16px',
        '::placeholder': {
          color: '#979999',
        },
      },
    },
  };

  elementsOptions: StripeElementsOptions = {
    locale: 'en',
  };

  stripeTest!: FormGroup;

  billingForm = this.fb.group({
    company: null,
    cardholder: [null, Validators.required],
    address: [null, Validators.required],
    address2: null,
    country: [null, Validators.required],
    city: [null, Validators.required],
    state: [null, Validators.required],
    postalCode: [
      null,
      [Validators.required, Validators.minLength(5), Validators.maxLength(8)],
    ],
  });

  hasUnitNumber = false;

  getStateFieldName(country?: string) {
    country = country?.toLowerCase();
    if (country == 'canada') {
      return 'Province';
    }
    if (country == 'united states') {
      return 'State';
    }
    if (country == 'united kingdom') {
      return 'Region';
    }
    if (country == 'australia') {
      return 'Province';
    }
    return 'State';
  }

  selectedCode!: string;

  setForm() {
    this.card?.element.on('change', ({ error }) => {
      // this.validCard = !error;

      if (error) {
        console.log(error);
      }
    });
  }

  saving = false;

  countries: any[] = [];
  states: any[] = [];

  // addresses = yourhandle;

  constructor(
    private cdr: ChangeDetectorRef,
    private loadService: LoadService,
    private fb: FormBuilder,
    private stripeService: StripeService
  ) {}
  ngAfterViewInit(): void {}

  ngOnInit(): void {
    // this.countries = yourhandle.getCountries();

    // this.loadService.getBilling((result) => {
    //   if (result) {
    //     if (result.billing_details?.address?.country) {
    //       this.billingForm.controls['country'].setValue(
    //         result.billing_details?.address?.country ?? ''
    //       );
    //       this.states = yourhandle.getCountryByShort(
    //         result.billing_details?.address?.country
    //       ).states;
    //     }

    //     if (result.billing_details?.name) {
    //       this.billingForm.controls['cardholder'].setValue(
    //         result.billing_details?.name ?? ''
    //       );
    //     }

    //     if (result.billing_details?.address?.line1) {
    //       this.billingForm.controls['address'].setValue(
    //         result.billing_details?.address?.line1 ?? ''
    //       );
    //     }

    //     if (result.billing_details?.address?.city) {
    //       this.billingForm.controls['city'].setValue(
    //         result.billing_details?.address?.city ?? ''
    //       );
    //     }

    //     if (result.billing_details?.address?.state) {
    //       this.billingForm.controls['state'].setValue(
    //         result.billing_details?.address?.state ?? ''
    //       );
    //     }

    //     if (result.billing_details?.address?.postal_code) {
    //       this.billingForm.controls['postalCode'].setValue(
    //         result.billing_details?.address?.postal_code ?? ''
    //       );
    //     }

    //     if (result.billing_details?.address?.line2) {
    //       this.billingForm.controls['address2'].setValue(
    //         result.billing_details?.address?.line2 ?? ''
    //       );
    //       this.hasUnitNumber = true;
    //     }
    //   }
    // });
  }

  loading = false;

  getFormDetails() {
    return {
      name: String(this.billingForm.controls['cardholder'].value),
      company: String(this.billingForm.controls['company'].value),
      address: String(this.billingForm.controls['address'].value),
      address2: String(this.billingForm.controls['address2'].value),
      country: String(this.billingForm.controls['country'].value),
      city: String(this.billingForm.controls['city'].value),
      state: String(this.billingForm.controls['state'].value),
      postalCode: String(this.billingForm.controls['postalCode'].value),
    };
  }

  createToken(): void {
    if (this.card && this.billingForm.valid) {
      let form = this.getFormDetails();
      this.loading = true;
      this.stripeService
        .createPaymentMethod({
          type: 'card',
          card: this.card.element,
          billing_details: {
            name: form.name,
            address: {
              country: form.country,
              line1: form.address,
              line2: form.address2,
              city: form.city,
              postal_code: form.postalCode,
              state: form.state,
            },
          },
        })
        .subscribe(async (result) => {
          if (result.paymentMethod?.id) {
            // Use the token
            await this.loadService.addPaymentMethod(result.paymentMethod.id);
            console.log(result.paymentMethod?.id);
          } else if (result.error) {
            // Error creating the token
            console.log(result.error.message);
          }
          this.loading = false;
        });
    }
  }
}
