CREATE EXTENSION postgis;

CREATE TABLE instance (
  id serial PRIMARY KEY,
  name text,
  url text,
  description text
);

CREATE TABLE region (
  id serial PRIMARY KEY,
  name text,
  level_id integer,
  geom geometry(MULTIPOLYGON, 4326),
  bbox geometry(POLYGON, 4326)
);

CREATE TABLE region_level (
  id serial PRIMARY KEY,
  instance_id integer,
  name text
);

CREATE TABLE region_data (
  id serial PRIMARY KEY,
  region_id integer,
  count integer,
  update_date date
);

CREATE TABLE isntance_region_xref (
  id serial PRIMARY KEY,
  instance_id integer,
  region_id integer
);

CREATE TABLE tag (
  id serial PRIMARY KEY,
  name text
);

CREATE TABLE tag_data (
  id serial PRIMARY KEY,
  tag_id integer,
  region_id integer,
  count integer,
  update_date date
);

CREATE TABLE category (
  id serial PRIMARY KEY,
  name text
);

CREATE TABLE category_data (
  id serial PRIMARY KEY,
  group_id integer,
  region_id integer,
  count integer,
  update_date date
);

CREATE TABLE organization (
  id serial PRIMARY KEY,
  name text
);

CREATE TABLE organization_data (
  id serial PRIMARY KEY,
  organization_id integer,
  region_id integer,
  count integer,
  update_date date
);
