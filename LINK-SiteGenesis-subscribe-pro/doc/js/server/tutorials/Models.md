Models typically wrap a system object and provide related functionalities which are not part of the Demandware API. Per convention model modules are named like the corresponding object and located under scripts/model. All models provide a get method which accept an instance of the system object or its semantic ID (where applicable).

Example to instantiate a Content model
```
// get content markup
require('~/app').getModel('content').get('footer-include').getMarkup();
```

The above example will return the markup of the asset footer-include. Now why do we need this and don't just use `dw.catalog.ContentMgr.getContent('footer-include').custom.body.markupText`? The benefit is that the model will handle all kinds of error conditions that i.e. in a templates you do not need any wrapping isif statements which handle cases such as the asset not existing, body not being defined etc. - this will give you the asset's HTML or an empty string.
