The caching of responses can be controlled by setting the expiration time at the response object.
Alternatively, the caching behavior can be set using the <iscache> tag in ISML templates. Both ways are legit.

By default, responses will not be cached. Caching is only supported for buffered responses for HTTP GET requests. Streamed responses cannot be cached.

If the expiration time is set multiple times at the response, the minimum value will be used.


### Absolute expiration time

For setting an absolute expiration time, a new date object for the wished time can be created and set at the response.

```
/**
 * The function which will handle the request
 */
function world(){
    // new Date(year, month, day, hours, minutes, seconds, milliseconds)
    var expires = new Date(2100, 4, 1, 12, 0, 0, 0);

    response.setExpires(expires);
    response.getWriter().print("Hello World!")
}

exports.World = require('~/cartridge/scripts/guard').ensure(['get'], world);
```


Cache daily until 3am in the morning (would be today if executed before 3am, or tomorrow):

```
    var Calendar = require('dw/util/Calendar');

    var now = new Calendar();
    var then = new Calendar();
    then.set(Calendar.HOUR_OF_DAY, 3);
    if (then.before(now))
    {
        then.add(Calendar.DATE, 1);
    }

    response.setExpires(then);
```


### Relative expiration time

For relative expiration, the time can be calculated by adding the wished caching period to the current time. Using a calendar objects can make the calculations easier.

Caching for 30 minutes from now on, using a calendar:

```
    var Calendar = require('dw/util/Calendar');

    var c = new Calendar();
    c.add(Calendar.Minute, 30);

    response.setExpires(c.getTime()); // c.getTime() returns a JavaScript Date
```


Caching for 30 minutes from now on, without calendar:

```
    response.setExpires(Date.now() + 30 * 60 * 1000);
```



### Disable caching

Caching can be disabled by simply setting an expiration time of 0.

```
    response.setExpires(0);
```



**That's how you cache responses!**
