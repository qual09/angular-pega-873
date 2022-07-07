// OAuth login box type (only recent testing with Main)
export const loginBoxType = {
  Main: 1,
  Popup: 2
  // Eventually support a visible Iframe/Inline Modal dialog variant as well
};

export const endpoints: any = {
  // Change this URL if you want to point the Angular application at another Pega server.
  PEGAURL: "https://localhost:1080/prweb",

  // Specify an appAlias to allow operators to access application when this application's access
  //  group is not the default access group specified within the operator record.
  //appAlias: "CableConnect",

  // use_OAuth should be set to false for basic authentication, and true to use OAuth 2.0
  // default is basic authentication 
  use_OAuth: false,
  // use_v2apis should be set to true only for Pega 8.5 and better servers, where the 'application'
  // service package exists.  Also, it must be configured to the same authentication type as the
  // api service package and what is specified by use_OAuth within this file
  // (Note: v2 apis are presently utilized only for Screen Flow Back button support)
  use_v2apis: false,

  // oauth config for both loign in screen/redirect and background login with clientid/secret
  // These settings are only significant when use_OAuth is set to true
  OAUTHCFG: {
    client_id: "62031018436007304421",

    // revoke endpoint for "Public" OAuth 2.0 client registrations are only available with 8.7 and later
    use_revoke: false,

    authService: "pega",
    // Other properties that might be specified to override default values
    // authorize, token, revoke

    // Optional params
    // client_secret is not advised for web clients (as can't protect this value) but is honored if present
    // client_secret: "",

    // main window login
    loginExperience: loginBoxType.Main
  },

  AUTH: "/authenticate",
  CASES: "/cases",
  CASETYPES: "/casetypes",
  VIEWS: "/views",
  ASSIGNMENTS: "/assignments",
  ACTIONS: "/actions",
  PAGES: "/pages",
  DATA: "/data",
  REFRESH: "/refresh",
  NAVIGATION_STEPS: "/navigation_steps", // for V2 API

  // showflatlist for debugging only, to show corresponding flatlist in a dialog, set to true (no quotes)
  SHOWFLATLIST: false,
  // can be "Basic" or "Full"
  FLATLISTTYPE: "Basic"
};
