import { AppComponent } from './../app.component';
import { DataService } from '../services/data.service';
import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-state-wise',
  templateUrl: './state-wise.component.html',
  styleUrls: ['./state-wise.component.css']
})
export class StateWiseComponent implements OnChanges{

  @Input() stateData: any[];
  currentStateStats : any[];
  selectedStateData : any[] ;
  isSelected : boolean = false;
  constructor( private service : DataService ){}

  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    this.service.getStateData()
    .subscribe( response => {
      this.currentStateStats  =  response;
      // console.log(this.currentStateStats['Bihar']);
    } ) 

  }

  getThisStateStats(value : string){
    this.selectedStateData = this.currentStateStats[value]['districtData'];
      console.log(this.selectedStateData);
  };
  

}
