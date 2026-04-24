import { Data } from '@angular/router';
import { DataService } from '../services/data.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-country-wise',
  templateUrl: './country-wise.component.html',
  styleUrls: ['./country-wise.component.css']
})
export class CountryWiseComponent implements OnInit {

  countrylist: any[];
  countryName = '';
  selectedCountryData: any[] = [];
  confirmedCase: number;
  activeCase: number;
  RecoveredCase: number;
  DeceasedCase: number;
  message = 'No Country Selected';
  cssMsg = 'alert alert-secondary text-uppercase mt-2';
  constructor(private service: DataService) { }

  ngOnInit() {
    this.service.getCountries()
    .subscribe( response => 
      {
        this.countrylist = response.sort((n1, n2) => n1.Country > n2.Country);
      },
      error => {
        this.cssMsg = 'spinner-border';
        this.message = '';
      });
  }
  thisCountryData(value: any){
    this.cssMsg = 'spinner-border';
    this.message = '';
    this.countryName = value.target.value;
    if (this.countryName !== 'select' && this.countryName !== 'India'){
      this.service.getSelectedCountryStats(this.countryName)
      .subscribe( response =>
        {
          this.selectedCountryData = response;

          this.confirmedCase = this.selectedCountryData.reduce((a: number , b) => a > b.Confirmed ? a : b.Confirmed, 0);
          this.activeCase = this.selectedCountryData.reduce((a: number , b) => a > b.Active ? a : b.Active, 0);
          this.RecoveredCase = this.selectedCountryData.reduce((a: number , b) => a > b.Recovered ? a : b.Recovered, 0);
          this.DeceasedCase = this.selectedCountryData.reduce((a: number , b) => a > b.Deaths ? a : b.Deaths, 0);
          if (this.selectedCountryData.length === 0){
            this.message = 'As per our data, This country has no covid-19 reports yet.';
            this.cssMsg = 'alert alert-success text-uppercase mt-2';
          }
        }, error => {
          this.cssMsg = 'spinner-border';
          this.message = '';

        }

      );
    }
    else if (this.countryName === 'India'){
      this.message = 'Data is displayed above';
      this.cssMsg = 'alert alert-primary text-uppercase mt-2';
      this.selectedCountryData = [];
    }
    else{
      this.message = 'No Country Selected. Select a country to see details.';
      this.cssMsg = 'alert alert-danger text-uppercase mt-2';
      this.selectedCountryData = [];
    }
  }

}
