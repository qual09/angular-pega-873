import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { endpoints } from './endpoints';

@Injectable({
  providedIn: 'root'
})
export class DatapageService {
  dataPageUrl = endpoints.BASEURL + endpoints.DATA;
  pxResults: Object;

  constructor(private http: HttpClient) { }

  getDataPage(id, dpParams) {
    return this.http.get(this.dataPageUrl + "/" + id, {
      observe: "response",
      params: dpParams,
    });
  }

  getResults(response) {
    return response.pxResults;
  }
}
