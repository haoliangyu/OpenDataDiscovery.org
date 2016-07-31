# OpenDataDiscovery.org

Currently working in progress. See the [**demo site**](http://ec2-52-87-229-42.compute-1.amazonaws.com/).

**OpenDataDiscovery.org** is a map of open data portals based on CKAN platforms and their state of data opening. This is a project to gain more understanding of the open world as a whole, not just pieces of it.

## How does it work?

A large number of [governments and organizations](http://ckan.org/instances/#) are using [CKAN](http://ckan.org/) to build their open data portals. As CKAN provides a full set of APIs for data searching, it is possible to build an application to collect information from all CKAN-bases portals.

Specially, we are collecting information about the state of data opening, including

* total number of opened datasets

* popular tags used by datasets

* dataset categories

* organizations that publish datasets

A program is setup to collect this information weekly for each portals. Check the [list of supported portals](https://github.com/OpenDataDiscovery/OpenDataDiscovery.org/blob/master/portals.md).

## How to Contribute?

Though this is largely a personal project, all contribution is welcomed. To set up your local instance, please

* install [virtual box](https://www.virtualbox.org/wiki/Downloads) and [vagrant](https://www.vagrantup.com/docs/installation/)

* run `vagrant up` to set up vagrant machine. By default it has 2 CPU and 2 GB memory, change it [here](https://github.com/haoliangyu/OpenDataDiscovery.org/blob/development/Vagrantfile#L51) if needed.

* download the bootstrap [data]() (with 5 layers) and restore it. You could access the database at `localhost:6060` with the [credential](https://github.com/haoliangyu/OpenDataDiscovery.org/blob/master/bootstrap/bootstrap.sh#L82)

* run `/vagrant/update.js` **inside the vagrant machine** to fetch data and generate tiles.

* Open the app at `localhost:8086`

See the [to-do list](https://github.com/haoliangyu/OpenDataDiscovery.org/blob/development/todo.md) for actively developing features and submit PR to **developing** branch.



## Thanks to these awesome people

* [Vitaly Tomilov](https://github.com/vitaly-t)
