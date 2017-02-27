Let's start simple and let's create a Hello World controller which we want to be accessible via the URL `http://dev01-realm-customer.demandware.net/on/demandware.store/Sites-SiteGenesis-Site/default/Hello-World`.

### Create the controller file

Let's assume we have a cartridge `app_my` but of course it will work with any cartridge. Go to `app_my/cartridge/scripts/controllers` (simply create the directory first in case it is missing) and now create a new file called `Hello.js`.

### Defining a public endpoint

To create a public endpoint you simply need to define a function and use the guard to define access control. Let's assume for our case that we want our Hello World example only to be accessible via *HTTP GET*

```
/**
 * The function which will handle the request
 */
function world(){
}

exports.World = require('~/cartridge/scripts/guard').ensure(['get'], world);
```

Done!

Now we can already see a white page at `http://dev01-realm-customer.demandware.net/on/demandware.store/Sites-SiteGenesis-Site/default/Hello-World`. Why is it white? Well we did not write anything to the response.

### Generating the output

For the sake of simplicity, let's just write *Hello World!* to the response, of course you can also use templates to render more sophisticated pages which is explained in the next chapter.

```
/**
 * The function which will handle the request
 */
function world(){
    response.getWriter().print("Hello World!")
}

exports.World = require('~/cartridge/scripts/guard').ensure(['get'], world);
```

### Generating better output using ISML templates

Now let's create an ISML template called `helloworld.isml` (in `my_app/cartridge/templates/default`) with some nice HTML and let's also use a dictionary key `Heading` that we pass along from the controller.

```
<html>
    <body>
        <h1>${pdict.Heading}</h1>
        <p>
            This is a bit more sophistication!
        </p>
    </body>
</html>
```

In order to render this template from the controller you can now simply do.

```
var guard = require('~/cartridge/scripts/guard');

/**
 * The function which will handle the request.
 */
function world(){
    var ISML = require('dw/template/ISML');
    ISML.renderTemplate('helloworld', {
        Heading : 'Hello World!'
    });
}

exports.World = guard.ensure(['get'], world);
```

**That's how you create controllers!**