# I N E E D C O F F E E
## A web application to find coffee shops near you.
#### Author: Sean Krinik

## About:
**INC** short for **I Need Coffee** is a javascript web application that utilizes a few different tools like the Google Maps javascript API, Foursquare API and KnockoutJS framework.

The app uses your location so please enable location services. The top 25 coffee shops from a Foursquare search will be shown on the map. You'll see a button that says **Hipsterify**. Clicking this will enter *"hipster mode"* and filter out any large chains from the results giving you a selection of only local or smaller chain coffee shops for you to try out. the **UN-Hipsterify** button un-toggles hipster mode showing you large chains as well.

Additionally, there is a **Find Me** button which will reset your map center to your current location (geolocation must be enabled on initial page load). In case you search another location and want to go back home, I got you covered.

The **Distance** button is a filter to show you those coffee shops within a mile from your location, or your map center. These are considered walking distance from you. If you're like me, you are always open to trying new coffee shops and sometimes they happen to be nearby so seeing those within walking distance helps!

The search bar uses the Google Geolocation API to help you search for coffee in other places. Suppose you are heading on a road trip later today, just search your destination and find what shop you want to hit once you arrive! Make sure to use hipster mode so you choose something local.

## Getting Started:

To run this web application, you can simply download the app from: [https://github.com/skrinik/FEND-Neighborhood-Map](https://github.com/skrinik/FEND-Neighborhood-Map)
and run it locally. Once the download completes, unzip the files and open your command prompt/terminal (mac). From there, navigate to the directory you just unzipped, and open ```index.html```. The app should run smoothly from there.

**Using localhost:**

Another option is to host the files locally using python's SimpleHTTPServer command. For documentation, please see: [https://docs.python.org/2/library/simplehttpserver.html](https://docs.python.org/2/library/simplehttpserver.html).
Install the cli for python v2/v3 (for more info on python see: [https://www.python.org/downloads/](https://www.python.org/downloads/)), then simply navigate to the directory yoy want to serve, and call ```python -m SimpleHTTPServer 8000``` (or replace 8000 with whatever port number you wish to use. CAREFUL, be wary of serving over any port, 8000/8080 are most common for local hosting).

#### *tl;dr*

```python -m SimpleHTTPServer 8000```


**Using localhost & ngrok**

To host the site temporarily on the web, we can use the above step to host the site locally, then use ngrok to expose the files to the web. Easiest way to use ngrok is to download the module from [https://ngrok.com/download](https://ngrok.com/download), put the module in your local directory, and call ngrok on the port you're serving the files on with your python simple server.

#### *tl;dr*

```python -m SimpleHTTPServer 8000```
then,
```ngrok http 8000```

## Functionality:

All calls to Foursquare & Google are asynchronous requests. I included the sources for solutions I found online for the obstacles I faced.

KnockoutJS is used to handle all DOM manipulations outside of the map. observable arrays store the markers for the map, but the markers themselves are NOT observable objects.

One notable improvement I was able to find online was the ability to create links to open the infowindows as listeners for each marker. You can click the name of a store in the list and see it's marker and infowindow on the map.

## Notable Challenges/Issues:

A few issues came with the Foursquare data. I wanted to display more info in the infowindows, but the information I got back from the ajax from Foursquare was limited and inconsistent. Additionally, when I ran a static call in the browser, I was able to get consistent results. Not sure if typing a call into the address bar differs from what you get when you call ```$.getJSON(...)``` but it seems to be a hurdle. Therefore, I only included the names of the shops for now.
