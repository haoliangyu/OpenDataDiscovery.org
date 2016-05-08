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
  category_id integer,
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

CREATE MATERIALIZED VIEW view_region_info AS
  WITH latest_category AS (
  	SELECT region_id, to_json(array_agg(item)) AS grouped_data FROM (
  		SELECT DISTINCT ON (region_id, category_id)
        region_id,
        json_build_object('category', c.name, 'count', count, 'update', update_date) AS item
  		FROM category_data AS cd
  		LEFT JOIN category AS c ON c.id = cd.category_id
  		ORDER BY region_id, category_id, update_date DESC) AS sorted_data
  	GROUP BY region_id
  ), latest_tag AS (
  	SELECT region_id, to_json(array_agg(item)) AS grouped_data FROM (
  		SELECT DISTINCT ON (region_id, tag_id) region_id, json_build_object('tag', t.name, 'count', count, 'update', update_date) AS item
  		FROM tag_data AS td
  		LEFT JOIN tag AS t ON t.id = td.tag_id
  		ORDER BY region_id, tag_id, update_date DESC) AS sorted_data
  	GROUP BY region_id
  ), latest_organization AS (
  	SELECT region_id, to_json(array_agg(item)) AS grouped_data FROM (
  		SELECT DISTINCT ON (region_id, organization_id)
        region_id,
        json_build_object('organization', o.name, 'count', count, 'update', update_date) AS item
  		FROM organization_data AS od
  		LEFT JOIN organization AS o ON o.id = od.organization_id
  		ORDER BY region_id, organization_id, update_date DESC) AS sorted_data
  	GROUP BY region_id
  ), latest_data AS (
  	SELECT DISTINCT ON (region_id) region_id, count, update_date
  	FROM region_data ORDER BY region_id, update_date DESC
  )
  SELECT
  	r.id AS region_id,
  	r.name AS region_name,
  	r.level_id,
    rl.name AS level_name,
    i.id AS instance_id,
    i.name AS instance_name,
    ld.count,
    ld.update_date,
    lt.grouped_data AS tags,
    lc.grouped_data AS categories,
    lo.grouped_data AS organizations,
  	ST_AsGeoJson(geom) AS geom,
    ST_AsGeoJson(bbox) AS bbox
  FROM region AS r
  LEFT JOIN region_level AS rl ON r.level_id = rl.id
  LEFT JOIN instance AS i ON rl.instance_id = i.id
  LEFT JOIN latest_data AS ld ON ld.region_id = r.id
  LEFT JOIN latest_category AS lc ON lc.region_id = r.id
  LEFT JOIN latest_tag AS lt ON lt.region_id = r.id
  LEFT JOIN latest_organization AS lo ON lo.region_id = r.id
  WHERE geom IS NOT NULL;
