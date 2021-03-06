
import * as _ from "lodash";
import { makeStateKey } from "@angular/platform-browser";

export class ReferenceHelper {

   lastControlID: number = 0;

  /**
   * Turn simple object with flat references into nested object to be POSTed.
   * E.g. { "pyWorkPage.Address.Street": "1 Rogers St" } --> {"Address":{"Street":"1 Rogers St"}}
   * Handles nested page lists and page groups.
   * @param { Object } newValues - An object containing fully qualified property paths as keys.
   * @return { Object } Object with nested keys and values corresponding to property paths.
   */
  getPostContent(newValues, updatedFields?: any, postableFields?: any) {
    let content = {};
    const bUseRepeatPI = localStorage.getItem("useRepeatPageInstructions") == "true";
    const bUseEmbedPI = localStorage.getItem("usePagePageInstructions") == "true";
    Object.keys(newValues).forEach(key => {
      if (updatedFields && updatedFields.has(key)) {
        const skipEntry = (bUseRepeatPI && key.includes("(")) || (bUseEmbedPI && key.includes(".") && !key.includes("("));
        if( !skipEntry ) {
          const nLastDot = key.lastIndexOf(".");
          const sFieldRef = key.substring(nLastDot + 1);
               
          if( !postableFields || (postableFields && postableFields.has(sFieldRef))) {
            ReferenceHelper.addEntry(key, newValues[key], content);
          } 
        }
      }
    });

    return content;
  }

  /**
   * Add entry in nested object for each flat fully qualified key.
   * @param { String } key - fully qualified path, e.g. pyWorkPage.Address.Street
   * @param { String } value - value corresponding to key
   * @param { Object } content - Object into which to add entry
   */
  static addEntry(key, value, content) {

    let propertyPathParts = key.split(".");
    let propertyName = propertyPathParts.pop();

    for (let i = 0; i < propertyPathParts.length; i++) {
      let pathPart = propertyPathParts[i];

      // Do not include pyWorkPage in content
      if (pathPart === "pyWorkPage") {
        continue;
      }

      // regex to match repeating references (PageList / PageGroup)
      if (/(.*)[(].+[)]$/.test(pathPart)) {
        // Use regex to split on parens to get ref and index, use filter to remove empty string at end
        let pageListParts = pathPart.split(/[()]/).filter(Boolean);
        let pageName = pageListParts[0];
        let pageIndex = pageListParts[1];

        if (isNaN(pageIndex)) {
          // Handling page group (associative array)
          if (!content[pageName]) {
            content[pageName] = { [pageIndex]: {} };
          }

          if (!content[pageName][pageIndex]) {
            content[pageName][pageIndex] = {};
          }

          content = content[pageName][pageIndex];
        } else {
          // Handling page list (1-indexed array)
          pageIndex = parseInt(pageIndex, 10);

          if (!content[pageName]) {
            content[pageName] = [];
          }

          for (let j = 0; j < pageIndex; j++) {
            if (!content[pageName][j]) {
              content[pageName][j] = {};
            }

            // if we are in the last iteration, that is the next object we want to nest into
            if (j === pageIndex - 1) {
              content = content[pageName][j];
            }
          }
        }
      } else {
        // We are dealing with a simple page, not list/group
        if (!content[pathPart]) {
          content[pathPart] = {};
        }
        content = content[pathPart];
      }
    }

    content[propertyName] = value;
  }

  /**
   * Get target repeating data structure from the PageGroup/List reference.
   * E.g. given 'pyWorkPage.Addresses' of type 'Group', return the Addresses object.
   * @param { String } reference - Property reference for PageGroup/List (e.g. pyWorkPage.Addresses)
   * @param { String } referenceType - Type of repeat. Group or List.
   * @param { Object } obj - Object to search for matching repeat object.
   * @return { Object / Array } Returns an object for PageGroup, array for PageList
   */
  getRepeatFromReference(reference, referenceType, obj) {
    let propertyPathParts = reference.split(".");
    let propertyName = propertyPathParts.pop();
    let tempObj = obj;

    // Consume each piece of property reference, indexing into object
    for (let i = 0; i < propertyPathParts.length; i++) {
      let pathPart = propertyPathParts[i];

      // Do not include pyWorkPage in content
      if (pathPart === "pyWorkPage") {
        continue;
      }

      // regex to match repeating references (PageList / PageGroup)
      if (/(.*)[(].+[)]$/.test(pathPart)) {
        // Use regex to split on parens to get ref and index, use filter to remove empty string at end
        let pageListParts = pathPart.split(/[()]/).filter(Boolean);
        let pageName = pageListParts[0];
        let pageIndex = pageListParts[1];

        if (isNaN(pageIndex)) {
          // Handling page group (associative array)
          tempObj = tempObj[pageName][pageIndex];
        } else {
          // Handling page list (Pega uses 1-indexed array, convert to 0-indexed)
          pageIndex = parseInt(pageIndex, 10) - 1;
          tempObj = tempObj[pageName][pageIndex];
        }
      } else {
        // We are dealing with a non-pagegroup/list object. Index into it directly.
        tempObj = tempObj[pathPart];
      }
    }

    // Initialize repeat if not previously initialized
    // If it is a page group, it must be an object. Otherwise, array.
    if (!tempObj[propertyName]) {
      tempObj[propertyName] = referenceType === "Group" ? {} : [];
    }

    return tempObj[propertyName];
  }

  /**
   * Given array or object corresponding to repeat, get a blank entry.
   * This is to get a 'blank' entry to be appended onto array for PageList,
   * or added into the object for a PageGroup.
   * @param { Object/Array } obj - Object from which to get blank entry. Object for PageGroup, or Array for PageList.
   */
  getBlankRowForRepeat(obj) {
    let blankRow;

    if (Array.isArray(obj)) {
      // Since we are preventing deleting the last row, it is always safe to assume there is 1 row in arr
      blankRow = _.cloneDeep(obj[0]);
    } else {
      // Dealing with Page Group, use random key as model to blank out
      blankRow = _.cloneDeep(obj[Object.keys(obj)[0]]);
    }

    ReferenceHelper.setObjectValuesBlank(blankRow);
    return blankRow;
  }

  /**
   * Used to blank out all initial values for an Object.
   * Used when appending an entry onto a PageList, or adding an entry for a PageGroup.
   * @param { Object } obj - Object whose values to blank
   */
  static setObjectValuesBlank(obj) {
    if (obj != null) {
      let keys = Object.keys(obj);

      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];

        // Ecountered an array of objects, ensure its length is only 1 and blank its values
        if (Array.isArray(obj[key])) {
          obj[key].splice(1);
          this.setObjectValuesBlank(obj[key][0]);

          // Encountered an object, blank its values
        } else if (typeof obj[key] === "object") {
          this.setObjectValuesBlank(obj[key]);

          // Encountered a plain key, set it's value blank
        } else {
          obj[key] = "";
        }
      }
    }
  }

  /**
   * Get PageGroup key given layout row.
   * To assist when constructing PageGroup grid.
   * @param { Object } row - corresponding to layout containing PageGroup
   * @return { String } String name of the PageGroup key corresponding to the layout row
   */
  static getPageGroupKeyFromRow(row) {
    for (let i = 0; i < row.groups.length; i++) {
      if (row.groups[i].field && row.groups[i].field.reference) {
        let pathParts = row.groups[i].field.reference.split(".");

        // Iterate backwards over path parts, because we want deepest pagegroup
        // To supported multi-nested PageGroups
        for (let j = pathParts.length - 1; j >= 0; j--) {
          if (/(.*)[(].+[)]$/.test(pathParts[j])) {
            // Use regex to split on parens to get ref and index, use filter to remove empty string at end
            let pageListParts = pathParts[j].split(/[()]/).filter(Boolean);

            // PageGroup keyname will always be the second part of above split on parens
            return pageListParts[1];
          }
        }
      }
    }

    return "";
  }

  /**
   * Get initial state for PegaForm, with all flat references.
   * We need all initial references on WO state so that when we add /remove a row
   * to a repeating list, we know where to append / delete.
   * This takes a view, and returns an object with all field references present.
   * @param { Object } view - View receieved from API endpoint
   * @return { Object } Object containing all initial property paths and values.
   */
  getInitialValuesFromView(view, state, bHasPI, bHasPagePI, postableFields) {
    return ReferenceHelper.processView(view, state, bHasPI, bHasPagePI, postableFields);
  }

  /**
   * Process a view from layout API data
   * @param { Object } view - view object
   * @param { Object } state - object in which to collect all initial paths and values. Defaults to empty obj.
   * @return { Object } object in which all initial paths and values are collected.
   */
  static processView(view, state = {}, bHasPI, bHasPagePI, postableFields) {
    if (view.visible || view.pageID) {
      ReferenceHelper.processGroups(view.groups, state, bHasPI, bHasPagePI, postableFields);
    }

    return state;
  }

  /**
   * Process an array of groups from layout API
   * @param { Array } groups - Corresponds to Groups array of objects return from API
   * @param { Object } state - object in which all initial paths and values are collected.
   */
  static processGroups(groups, state, bHasPI, bHasPagePI, postableFields) {
    if( !groups ) return;
    for (let i = 0; i < groups.length; i++) {
      let group = groups[i];

      if (group.view) {
        ReferenceHelper.processView(group.view, state, bHasPI, bHasPagePI, postableFields);
      }

      if (group.layout) {
        ReferenceHelper.processLayout(group.layout, state, bHasPI, bHasPagePI, postableFields);
      }

      if (group.field) {
        ReferenceHelper.processField(group.field, state, postableFields);
      }

    }
  }



  /**
   * Process a layout from layout API
   * @param { Object } layout - layout object
   * @param { Object } state - object in which all initial paths and values are collected.
   */
  static processLayout(layout, state, bHasPI, bHasPagePI, postableFields) {
    if (layout.rows) {
      layout.rows.forEach(row => {
        ReferenceHelper.processGroups(row.groups, state, bHasPI, bHasPagePI, postableFields);
      });
    } else if (layout.view) {
        ReferenceHelper.processView(layout.view, state, bHasPI, bHasPagePI, postableFields);
    } else {
      ReferenceHelper.processGroups(layout.groups, state, bHasPI, bHasPagePI, postableFields);
    }
  }

  /**
   * Process a field from layout API.
   * It is at this point that an entry is added to the state object.
   * @param { Object } field - field object returns from API
   * @param { Object } state - object in which key/value entry is added for property reference.
   */
  static processField(field, state, postableFields) {
    if ((field.visible || (field.control && field.control.type === "pxHidden"))  && !field.readOnly && !field.disabled)  {    
      // can not post pyTemplateGeneric
      if (field.reference  && field.referemce != "" && field.reference.indexOf("pyTemplate") < 0 ) {
        state[field.reference] = this.htmlDecode_local(field.value);
        postableFields.add(field.fieldID);
      }

    }
  }


  customUpdateJSON(object, key, value){
    if (object.hasOwnProperty(key) && object[key]==value) {
        return object;
    }

    for (let i=0; i<Object.keys(object).length; i++) {
        if (typeof object[Object.keys(object)[i]]=="object") {
            let objNode = this.customUpdateJSON(object[Object.keys(object)[i]], key, value);
            if (objNode != null)
                return objNode;
        }
    }

    return null;
  } 

/*
  getControlNameFromReference(sRef: string) {
    let returnString = sRef.replace(/\./gi, "-");
    //returnString = returnString.replace(/\(/gi, "-");
    //returnString = returnString.replace(/\)/gi, "-");


    return returnString;
  }
*/

  getControlNameFromReference(sRef: string, oNode: object): string {
    let arList = [];
    this.findObjects(oNode, "reference", sRef, arList);

    if (arList.length > 0) {
      let oField = arList[0];
      return oField.controlName;
    }
    else {
      return "";
    }
  }


  findObjects(obj, targetProp, targetValue, finalResults) : any {

    function getObject(theObject) {
      let result = null;
      if (theObject instanceof Array) {
        for (let i = 0; i < theObject.length; i++) {
          getObject(theObject[i]);
        }
      }
      else {
        for (let prop in theObject) {
          if(theObject.hasOwnProperty(prop)){
            //console.log(prop + ': ' + theObject[prop]);
            if (prop === targetProp) {
              //console.log('--found id');
              if (theObject[prop] === targetValue) {
                //console.log('----found porop', prop, ', ', theObject[prop]);
                finalResults.push(theObject);
              }
            }
            if (theObject[prop] instanceof Object || theObject[prop] instanceof Array){
              getObject(theObject[prop]);
            }
          }
        }
      }
    }
  
    getObject(obj);
  
  }

  removeDataPages(stateObject) {

    for (let sKey in stateObject) {
      if (sKey.indexOf("D_") == 0 || sKey.indexOf("Declare_") == 0 ) {
        delete stateObject[sKey];
      }
    }

    return stateObject;

  }

  static htmlDecode_local(sVal:string ):string {
    let doc = new DOMParser().parseFromString(sVal, "text/html");
    return doc.documentElement.textContent;
  }

  htmlDecode(sVal:string):string {
    if(sVal === undefined){
      return "";
    }
    return ReferenceHelper.htmlDecode_local(sVal);
  }


  updateViewWithLocalState(view, state) {
    return ReferenceHelper.updateViewWithState(view, state);
  }

  static updateViewWithState(view, state) {

    ReferenceHelper.updateGroupsWithState(view.groups, state);


    return view;
  }

  static updateGroupsWithState(groups, state) {
    for (let i = 0; i < groups.length; i++) {
      let group = groups[i];

      if (group.view) {
        ReferenceHelper.updateViewWithState(group.view, state);
      }

      if (group.layout) {
        ReferenceHelper.updateLayoutWithState(group.layout, state);
      }

      if (group.field) {

        ReferenceHelper.updateFieldWithState(group.field, state);
      }
    }   

  }

  static updateLayoutWithState(layout, state) {

    if (layout.rows) {
      layout.rows.forEach(row => {
        ReferenceHelper.updateGroupsWithState(row.groups, state);
      });
    } else {
      ReferenceHelper.updateGroupsWithState(layout.groups, state);
    }
  }

  static updateFieldWithState(field, state) {

    if ((field.visible || (field.control && field.control.type === "pxHidden"))  && !field.readOnly && !field.disabled && field.reference)  {
      
      // can not post pyTemplateGeneric
      if (field.reference.indexOf("pyTemplate") < 0) {
        if (state[field.reference] != null) {
          field.value = state[field.reference];
        }
      }

    }
  }

  getUniqueControlID() : string {

    var sPrefix = "control-";

    this.lastControlID++;

    return sPrefix + this.lastControlID.toString();



  }

  isTrue(val: any) : boolean {
    let bReturn = false;
    if (typeof(val) == "string") {
      if (val.toLowerCase() == "true") {
        bReturn = true;
      }
    }
    else {
      bReturn = val;
    }

    return bReturn;
  }

}
