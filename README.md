# hubspot-wrapper
Hubspot wrapper

```javascript
const Sbxhubspot = require('sbxhubspot')   
let coC =  new Sbxhubspot.CustomObjectController({ hubspotApiKey,  portalId} );
let contactC = new  Sbxhubspot.CustomerController({ hubspotApiKey,  portalId} );
let companyC = new  Sbxhubspot.CustomerController({ hubspotApiKey,  portalId} );
companyC.initialize("companies");

```
