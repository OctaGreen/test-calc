import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppButtonComponent } from './app-button/app-button.component';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    AppButtonComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
