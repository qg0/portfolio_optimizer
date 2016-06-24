import {Component, OnInit} from '@angular/core';
import {HTTP_PROVIDERS} from '@angular/http';

import {OptimizerDataService} from './optimizer-data.service';
import {InputComponent} from './input/input.component';
import {BarchartComponent} from './barchart/barchart.component';
import {ResultsTableComponent} from './results-table/results-table.component';

@Component({
  moduleId: module.id,
  selector: 'optimizer',
  templateUrl: 'optimizer.component.html',
  styleUrls: ['optimizer.component.css'],
  directives: [InputComponent, BarchartComponent, ResultsTableComponent],
  providers: [OptimizerDataService, HTTP_PROVIDERS]
})
export class OptimizerComponent {
  optimalAllocs: Array<Object>;
  sharpeRatio: number;
  trailingDecimals: number = 4;
  // Model of recent button submit
  query: Object = {endDate: "03/20/2016",
           initialInvestment: "1000",
           startDate: "01/01/2012",
           symbols: ["FB", "GOOG", "AAPL"]};

  //optimalAllocs = {AAPL: 0.0,
  //                 GOOG: 0.5489549524820141,
  //                 FB: 0.4510450475179859};
  //sharpeRatio = 0.5730332517669126;

  //2D array of strings
  tableRows: Array<Array<string>>;


  constructor(private optimizerDataService: OptimizerDataService) {

  }
  parseResponse(response: Object) {
    //Parse the new HTTP response from the stream into the local variables
    
    //Format optimalAllocs
    this.optimalAllocs = [];
    let obj: Object;
    for(let k of Object.keys(response["optimal_allocations"]))
    {
    obj = {};
    obj[k] = response["optimal_allocations"][k];
    this.optimalAllocs.push(obj);
    }

    //Format tableRows
    this.sharpeRatio = response["sharpe_ratio"];
    this.tableRows = [['Stock','Starting Value','Ending Value','Sharpe Ratio']];
    let row: Array<string>;
    for (let key of Object.keys(response["optimal_allocations"])) {
      row = [];
      row.push(key);
      row.push((this.query["initialInvestment"] / Object.keys(response["optimal_allocations"]).length).toFixed(this.trailingDecimals).toString());
      row.push((response["optimal_allocations"][key] * this.query["initialInvestment"]).toFixed(this.trailingDecimals).toString());
      row.push("");
      this.tableRows.push(row);
    }
    let lastRow: Array<string> = [];
    lastRow.push("Total");
    lastRow.push(this.query["initialInvestment"].toString());
    lastRow.push(this.query["initialInvestment"].toString());
    lastRow.push(this.sharpeRatio.toFixed(this.trailingDecimals).toString());
    this.tableRows.push(lastRow);
  }

  onSubmit(value: Object) {
    // Triggered by the submition of the button in the input component
    this.query = value;
    this.optimizerDataService.formDataSubjectChange(value);
  }

  subscribeToResponse() {
    // Subscribe to the stream that will have HTTP Post responses
    this.optimizerDataService.responseSubject.subscribe(
      (response) => {
        //next value
        this.parseResponse(response);
      },
      (err) => {
        console.log('Response stream error: ' + err);
      },
      () => {
        console.log('Response stream completed');
      });
  }

  ngOnInit() {
    this.tableRows = [[]];
    this.optimalAllocs = [];
    this.optimizerDataService.prepareFormDataSubject(this.query);
    this.subscribeToResponse();
 }
}
