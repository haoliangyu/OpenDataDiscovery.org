# OpenDataDiscovery.org

[**OpenDataDiscovery.org**](http://www.opendatadiscovery.org) is a project to track and present the world of open data.

## Why do I start this project?

Because the world of open data is highly fragmented and separated. There are numerous data owners and publishers across the world, who acts individually and creates lots of information islands. We know everyone is publishing open data and open data is very accessible, but we fail to answer some fundamental questions about data opening:

> How many datasets haven open on earth?

> How many data portals do we have now?

> How are these portals acting?

> What data can we find for a specific place?

> If I search for something, how many and what should I get?

It's thrilling to see the emerging open data at every corner of the world and the Internet. However, open data is not open until people are able to realize it. With this project, I hope to track and visualize the world of open data for the people who are entering and exploring this exciting world.

## How does it work?

Fortunately the open data community is creating standards and good practices. Several major open data platforms, which supports hundreds of open data portals worldwide, have provided the feature of web query. It enables user to gather information from data portals without manually checking them on by one.

Just take [CKAN](http://ckan.org/), one of the most widely used open data platform, as example.

Data portal based on CKAN is publishing its portal summary including

* dataset number

* dataset tags

* dataset categories

* dataset publishers

This information provides an overview of the status and performance of the portal. By constantly collecting the information of data portals, it is possible to create an overview of major data portals and answer the questions of the world of open data. It would gain us more understanding on the current status of data opening and probably provide a guide on how to improve it.

## So what is your progress?

OpenDataDiscovery.org has supported following platforms:

* [CKAN](http://ckan.org/) (101 portals)

* [Socrata](https://socrata.com/solutions/publica-open-data-cloud/) (155 portals)

For more details, see the [portal list](https://github.com/haoliangyu/OpenDataDiscovery.org/blob/master/portals.md).

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
