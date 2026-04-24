import { Component, OnInit  } from '@angular/core';
import { DataService } from '../services/data.service';

import * as $ from 'jquery';
import * as CanvasJS from '../../assets/canvasjs.min';

@Component({
  selector: 'app-chart-js',
  templateUrl: './chart-js.component.html',
  styleUrls: ['./chart-js.component.css']
})
export class ChartJsComponent implements OnInit {

  constructor(private service: DataService) { }

  ngOnInit() {
    const dataPoints = [];
    const recoveredDatapoint = [];
    const deathsDatapoint = [];
    let dpsLength = 0;
    const chart = new CanvasJS.Chart('chartContainer', {
      theme: 'light2',
      animationEnabled: true,
      axisX: {
        valueFormatString: 'MMM DD YYYY'
      },
      axisY: {
        title: 'No of Cases',
      },
      toolTip: {
        shared: 'true'
      },
      legend: {
        cursor: 'pointer',
      },
      data: [{
        type: 'spline',
        showInLegend: true,
        Name : 'Total Cases',
        dataPoints,
      },
      {
        type: 'spline',
        showInLegend: true,
        name: 'Recovered',
        dataPoints : recoveredDatapoint,
      },
      {
        type: 'spline',
        showInLegend: true,
        name: 'Deaths',
        dataPoints : deathsDatapoint,
      }
    ]
  });

    $.getJSON('https://api.covid19india.org/data.json', function(data) {
    $.each(data.cases_time_series, function(key, value){
      dataPoints.push({x: new Date(value.date) , y: parseInt(value.totalconfirmed)});
      recoveredDatapoint.push({x: new Date(value.date) , y: parseInt(value.totalrecovered)});
      deathsDatapoint.push({x: new Date(value.date) , y: parseInt(value.totaldeceased)});
    });
		  dpsLength = dataPoints.length;
    chart.render();
  });
  }
}
