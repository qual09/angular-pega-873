## Implementation Related Notes

Purpose of this section is to document things of interest related to the code so that they are here for posterity to refer back to for the original developer or anyone trying to maintain this code

* package.json composition related
    * To generate the package-lock.json file...removed this file and node_modules and did a npm install followed by a `npm audit fix`.  An `npm audit fix --force` will result in moving the @angular-devkit/build-angular component to the Angular 13 version.  This seems to infer that all the outstanding vulnerabilities are buildtime related and not runtime related?

