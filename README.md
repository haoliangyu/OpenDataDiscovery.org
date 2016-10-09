# OpenDataDiscovery.ORG

[**OpenDataDiscovery.org**](http://www.opendatadiscovery.org) aims at presenting the current and history status of data opening worldwide by constantly collecting, analyzing, and visualizing over 90+ governmental data portals worldwide.

## Why do we start this project?

Because the world of open data is highly fragmented. As data in the world is owned by numerous governments and institutes, the effort of data opening spreads widely across the Internet as well as the world. This fact makes it uneasy to generate a precise overview of the movement of open data and even the answer to the simplest question is still very ambiguous:

> How many datasets haven open on earth?

The website is a step further to figure out question like this.

## How does it work?

Fortunately, the open data community is forming the standards and good practices. There are several major open data platforms that have been adopted by many governments and institutes. As most of them open the API for searching, this makes it possible for developers to perform data harvesting and conduct analysis based on the information.

Just take [CKAN](http://ckan.org/), one of the most widely used open data platform, as example.

If a government chooses CKAN to developer its data portal, it will also expose the standard CKAN API. Particularly, we are able to search the following information:

* datasets number

* datasets tags

* dataset categories

* dataset publishers

As all CKAN-based portals open their APIs a similar manner. We are able to get the information for the whole CKAN network by looping the API searching for each portal.

By looping the procedure for all major data portal network and harmonizing the information, we should be able to have a more precise picture of the world of open data.

If we keep track with this information, it would be possible to provide a view of the progress of the open data movement.

## So what is your progress?

OpenDataDiscovery.org now have supported:

* CKAN (101 portals)

For more detail, see [portal list](https://github.com/haoliangyu/OpenDataDiscovery.org/blob/master/portals.md).

## How to setup and contribute?

This project is built on [Node.js](https://nodejs.org/en/), [AngularJS](https://angularjs.org/), and [Leaflet](http://leafletjs.com/).

* install [virtual box](https://www.virtualbox.org/wiki/Downloads) and [vagrant](https://www.vagrantup.com/docs/installation/)

* run `vagrant up` to set up vagrant machine. By default it has 2 CPU and 2 GB memory, change it [here](https://github.com/haoliangyu/OpenDataDiscovery.org/blob/development/Vagrantfile#L51) if needed.

* run `node /vagrant/opendatadiscovery.org/tile-generator/generator.js` **inside the vagrant machine** to download data and generate map tiles.

* run `npm run webpack-watch` to build the application

* Open the app at `localhost:8086`

Please feel free to open an issue if you have any question or suggestion.

## Thanks to these awesome people

* [Vitaly Tomilov](https://github.com/vitaly-t)
