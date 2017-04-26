# I N E E D C O F F E E ![I NEED COFF](https://github.com/skrinik/INeedCoffee-grandmaster/blob/master/img/inc-75w.png?raw=true "I N E E D C O F F E E Logo")
## A web application to find coffee shops near you.
#### Author: Sean Krinik

## About:
**INC** short for **I Need Coffee** is a javascript web application that utilizes a few different tools like the Google Maps javascript API, Foursquare API and KnockoutJS framework.

The app uses your location so please enable location services. The top 25 coffee shops from a Foursquare search will be shown on the map. You'll see a button that says **Hipsterify**. Clicking this will enter *"hipster mode"* and filter out any large chains from the results giving you a selection of only local or smaller chain coffee shops for you to try out. the **UN-Hipsterify** button un-toggles hipster mode showing you large chains as well.

Additionally, there is a **Find Me** button which will reset your map center to your current location (geolocation must be enabled on initial page load). In case you search another location and want to go back home, I got you covered.

The **Distance** button is a filter to show you those coffee shops within a mile from your location, or your map center. These are considered walking distance from you. If you're like me, you are always open to trying new coffee shops and sometimes they happen to be nearby so seeing those within walking distance helps!

The search bar uses the Google Geolocation API to help you search for coffee in other places. Suppose you are heading on a road trip later today, just search your destination and find what shop you want to hit once you arrive! Make sure to use hipster mode so you choose something local.

## Getting Started:

This app is hosted on Github pages! Visit [**I NEED COFFEE**](https://skrinik.github.io/INeedCoffee-grandmaster/) to access the app and try it out.

## Functionality:

All calls to Foursquare & Google are asynchronous requests. I included the sources for solutions I found online for the obstacles I faced.

KnockoutJS is used to handle all DOM manipulations outside of the map. observable arrays store the markers for the map, but the markers themselves are NOT observable objects.

One notable improvement I was able to find online was the ability to create links to open the infowindows as listeners for each marker. You can click the name of a store in the list and see it's marker and infowindow on the map.

## Notable Challenges/Issues:

A few issues came with the Foursquare data. I wanted to display more info in the infowindows, but the information I got back from the ajax from Foursquare was limited and inconsistent. Additionally, when I ran a static call in the browser, I was able to get consistent results. Not sure if typing a call into the address bar differs from what you get when you call ```$.getJSON(...)``` but it seems to be a hurdle. Therefore, I only included the names of the shops for now.

If you run into any bugs, please feel free to reach out to me with the issue and I will work on it.

### Enjoy!
