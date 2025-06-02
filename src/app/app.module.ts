import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {FormsModule} from "@angular/forms";
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {getFirestore, provideFirestore} from '@angular/fire/firestore';
import {getAuth, provideAuth} from "@angular/fire/auth";
import {environment} from "../environments/environment.prod";
import {SelectJudgeModal} from "./modals/select-judge.modal";
import {SelectPlayerModal} from "./modals/select-player.modal";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    SelectJudgeModal,
    SelectPlayerModal
  ],
  providers: [
    provideFirebaseApp(() => {
      return initializeApp(environment.firebaseConfig)
    }),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
