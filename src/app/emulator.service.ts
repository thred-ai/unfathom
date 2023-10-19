import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root',
})
export class EmulatorService {
  isEmulator: boolean = false;

  constructor(
    private functions: AngularFireFunctions,
    private firestore: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage
  ) {}

  initEmulator() {
    this.isEmulator = true
    this.functions.useEmulator('localhost', 5001);
    this.firestore.firestore.useEmulator('localhost', 8080);
    this.auth.useEmulator('http://127.0.0.1:9099');
    this.storage.storage.useEmulator('localhost', 9199);
  }

}
