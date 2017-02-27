The views are supposed to provide auxiliary functionality for the templates, the super class view/View provides some base infrastructure which is shared by all views.

## Usage

```
// use anonymous view
require('~/app').getView().render('path/to/template');


// or use a named view
require('~/app').getView("Product",{
    product : product,
    showRecommendations : false
}).render('path/to/template');
```

The optional parameters which can be passed will be passed on to the constructor of the View, in case an anonymous view is used the key value pairs will be available in the pipeline dictionary.

All views provide the following dictionary keys:

* `Meta` - the meta object for this request
* `View` - a reference to the view itself
* `CurrentForms` - for backward compatibility reasons
* `CurrentHttpParameterMap` - for backward compatibility reasons