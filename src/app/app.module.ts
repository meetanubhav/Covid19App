import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localeEnIn from '@angular/common/locales/en-IN';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { CountryWiseComponent } from './country-wise/country-wise.component';
import { FooterComponent } from './footer/footer.component';
import { ChartJsComponent } from './chart-js/chart-js.component';
import { StateWiseComponent } from './state-wise/state-wise.component';
import { StatCardsComponent } from './stat-cards/stat-cards.component';

registerLocaleData(localeEnIn, 'en-IN');

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    CountryWiseComponent,
    FooterComponent,
    ChartJsComponent,
    StateWiseComponent,
    StatCardsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'en-IN' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
