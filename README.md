# Neighbordhood Map

This is the neighbord hood app

To use follow the steps below:
1. Download the project, and open the directory
2. Make sure you are connected to the internet
3. Open index.html
4. Use the filter box at the top to filter for locations
5. Click on markers or list items for more information about a location
6. Explore!

Configurations
1. `locations` is a map of locations. To add to it, follow the format,

```json
{
    "location": {
            "Latitude" : "Your location latitude",
            "Longitude" : "Your location Longitude"
        },
    "title": "Your Location Name"
}
```
  Then insert this into the `locations` map at the top of `app.js`
2. You can change the center of the map by changing the values `lat` and `lng` in `var startLocale`

### Author
* Andy Chou

This project uses code from and is part of the [Udacity Full Stack Program](https://classroom.udacity.com/nanodegrees/nd004/syllabus)
