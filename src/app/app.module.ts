import { DataService } from './services/data.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { NgForm, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { CountryWiseComponent } from './country-wise/country-wise.component';
import { FooterComponent } from './footer/footer.component';
import { ChartJsComponent } from './chart-js/chart-js.component';
import { StateWiseComponent } from './state-wise/state-wise.component';

@NgModule({
   declarations: [
      AppComponent,
      NavBarComponent,
      CountryWiseComponent,
      FooterComponent,
      ChartJsComponent,
      StateWiseComponent
   ],
   imports: [
      BrowserModule,
      AppRoutingModule,
      FormsModule,
      HttpClientModule
   ],
   providers: [
      DataService,
   ],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
