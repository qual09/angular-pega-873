import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { endpoints } from './endpoints';
import { ReferenceHelper } from '../_helpers/reference-helper';

@Injectable({
  providedIn: 'root'
})
export class CaseService {

  refHelper: ReferenceHelper = new ReferenceHelper();
  caseUrl = endpoints.BASEURL + endpoints.CASES;
  caseTypeUrl = endpoints.BASEURL + endpoints.CASETYPES;

  constructor(private http: HttpClient) { }

  // get a case of given id
  getCase(id) {
    let caseHeaders = new HttpHeaders();
    caseHeaders = caseHeaders.append('Access-Control-Expose-Headers', "etag");

    return this.http.get(this.caseUrl + "/" + id, {
      observe: "response",
      headers: caseHeaders,
    });
  }

  // get a list of possible case types to create
  getCaseTypes() {
    return this.http.get(this.caseTypeUrl, { observe: 'response' });   
  }

  // get a case that is "new" 
  getCaseCreationPage(id) {
    return this.http.get(this.caseTypeUrl + "/" + id, { observe: 'response' });
  }

  // create a case (with new or skip new)
  createCase(id, processName, content) {
    const caseBody: any = {};
    caseBody.caseTypeID = id;
    caseBody.processID = processName !== null ? processName : "";
    caseBody.content = content;

    return this.http.post(this.caseUrl, caseBody, { observe: 'response' });   
  }

  // update a case, save to server
  updateCase(caseID, eTag, actionName, body, pageInstr, updatedFields, postableFields) {
    let caseParams = new HttpParams();
    if (actionName && actionName != "") {
      caseParams = caseParams.append('actionID', actionName);
    }

    let caseHeaders = new HttpHeaders();
    caseHeaders = caseHeaders.append('If-Match', '"' + eTag + '"');
    
    const oContent = this.refHelper.getPostContent(body, updatedFields, postableFields);

    const encodedId = encodeURI(caseID);

    if (pageInstr.pageInstructions.length > 0) {
      return this.http.put(
        this.caseUrl + "/" + encodedId,
        { content: oContent, pageInstructions: pageInstr.pageInstructions },
        { observe: "response", params: caseParams, headers: caseHeaders }
      );  
    } else {
      return this.http.put(
        this.caseUrl + "/" + encodedId,
        { content: oContent },
        { observe: "response", params: caseParams, headers: caseHeaders }
      );  
    } 
  }

  // refresh a case, post data, but no save
  refreshCase(myCase, body) {
    let caseHeaders = new HttpHeaders();
    caseHeaders = caseHeaders.append('If-Match', myCase.etag);

    const oContent = this.refHelper.getPostContent(body);
    
    const encodedId = encodeURI(myCase.ID);

    return this.http.put(
      this.caseUrl + "/" + encodedId + endpoints.REFRESH,
      { content: oContent },
      { observe: "response", headers: caseHeaders }
    );     
  }

  // get a case with a given page (new, review, confirm)
  getPage(caseID, pageID) {
    return this.http.get(
      this.caseUrl + "/" + caseID + endpoints.PAGES + "/" + pageID,
      { observe: "response" }
    );
  }

  // get a case and a view layout
  getView(caseID, viewID) {
    return this.http.get(
      this.caseUrl + "/" + caseID + endpoints.VIEWS + "/" + viewID,
      { observe: "response" }
    ); 
  }

  cases() {
    return this.http.get(this.caseUrl, { observe: "response" });
  }
}
