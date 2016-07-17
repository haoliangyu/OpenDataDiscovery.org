CREATE EXTENSION postgis;

CREATE TABLE instance (
  id serial PRIMARY KEY,
  name text,
  url text,
  location text,
  description text,
  crawl_schedule text,
  georeferenced boolean DEFAULT false
);

CREATE TABLE region (
  id serial PRIMARY KEY,
  name text,
  geom geometry(MULTIPOLYGON, 4326),
  bbox geometry(POLYGON, 4326)
);

CREATE TABLE instance_region_xref (
  id serial PRIMARY KEY,
  instance_id integer,
  region_id integer,
  instance_region_level_id integer
);

CREATE TABLE region_level (
  id serial PRIMARY KEY,
  name text
);

INSERT INTO region_level (id, name) VALUES
(0, 'Continent'),
(1, 'Nation'),
(2, 'Provice/State'),
(3, 'Megalopolis'),
(4, 'City');

CREATE TABLE instance_region_level (
  id serial PRIMARY KEY,
  instance_id integer references instance(id),
  level integer references region_level(id),
  layer_name text,
  active boolean DEFAULT true
);

CREATE TABLE region_data (
  id serial PRIMARY KEY,
  instance_region_xref_id integer,
  count integer,
  create_date date,
  update_date date
);

CREATE INDEX region_data_update_date_idx ON region_data (update_date);
CREATE INDEX region_data_xref_id_idx ON region_data (instance_region_xref_id);

CREATE TABLE tag (
  id serial PRIMARY KEY,
  name text
);

CREATE TABLE instance_region_tag_xref (
  id serial PRIMARY KEY,
  tag_id integer,
  instance_region_xref_id integer
);

CREATE INDEX instance_region_tag_xref_ir_id_idx ON instance_region_tag_xref (instance_region_xref_id);

CREATE TABLE tag_data (
  id serial PRIMARY KEY,
  instance_region_tag_xref_id integer,
  count integer,
  create_date date,
  update_date date
);

CREATE INDEX tag_data_update_date_idx ON tag_data (update_date);
CREATE INDEX tag_data_xref_id_idx ON tag_data (instance_region_tag_xref_id);

CREATE TABLE category (
  id serial PRIMARY KEY,
  name text
);

CREATE TABLE instance_region_category_xref (
  id serial PRIMARY KEY,
  category_id integer,
  instance_region_xref_id integer
);

CREATE INDEX instance_region_category_xref_ir_id_idx ON instance_region_category_xref (instance_region_xref_id);

CREATE TABLE category_data (
  id serial PRIMARY KEY,
  instance_region_category_xref_id integer,
  count integer,
  create_date date,
  update_date date
);

CREATE INDEX category_data_update_date_idx ON category_data (update_date);
CREATE INDEX category_data_xref_id_idx ON category_data (instance_region_category_xref_id);

CREATE TABLE organization (
  id serial PRIMARY KEY,
  name text
);

CREATE TABLE instance_region_organization_xref (
  id serial PRIMARY KEY,
  organization_id integer,
  instance_region_xref_id integer
);

CREATE INDEX instance_region_organization_xref_ir_id_idx ON instance_region_organization_xref (instance_region_xref_id);

CREATE TABLE organization_data (
  id serial PRIMARY KEY,
  instance_region_organization_xref_id integer,
  count integer,
  create_date date,
  update_date date
);

CREATE INDEX organization_data_update_date_idx ON organization_data (update_date);
CREATE INDEX organization_data_xref_id_idx ON organization_data (instance_region_organization_xref_id);

CREATE OR REPLACE VIEW view_vector_tile_layer AS (
  SELECT
    i.id AS instance_id,
    i.name AS instance_name,
    irl.level,
    rl.name AS level_name,
    irl.layer_name,
    irl.active
    FROM instance_region_level AS irl
    LEFT JOIN region_level AS rl ON rl.id = irl.level
    LEFT JOIN instance AS i ON i.id = irl.instance_id
);

CREATE MATERIALIZED VIEW view_instance_region AS
  SELECT
    r.id AS region_id,
    r.name AS region_name,
    irl.level AS level,
    rl.name AS level_name,
    i.id AS instance_id,
    i.name AS instance_name,
    geom,
    bbox
  FROM instance AS i
  RIGHT JOIN instance_region_xref AS irx ON i.id = irx.instance_id
  LEFT JOIN region AS r ON r.id = irx.region_id
  LEFT JOIN instance_region_level AS irl ON irl.id = irx.instance_region_level_id
  LEFT JOIN region_level AS rl ON rl.id = irl.level
  WHERE r.geom IS NOT NULL;

CREATE INDEX view_instance_region_geom_idx ON view_instance_region USING gist(geom)

CREATE VIEW view_instance_tag AS
  SELECT
    i.id AS instance_id,
    i.name AS instance_name,
    t.id AS tag_id,
    t.name AS tag_name
  FROM instance AS i
  RIGHT JOIN instance_region_xref AS irx ON irx.region_id = i.id
  RIGHT JOIN instance_region_tag_xref AS irtx ON irtx.instance_region_xref_id = irx.id
  LEFT JOIN tag AS t ON t.id = irtx.tag_id
  GROUP BY t.id, i.id;

CREATE VIEW view_instance_category AS
  SELECT
    i.id AS instance_id,
    i.name AS instance_name,
    c.id AS category_id,
    c.name AS category_name
  FROM instance AS i
  RIGHT JOIN instance_region_xref AS irx ON irx.region_id = i.id
  RIGHT JOIN instance_region_category_xref AS ircx ON ircx.instance_region_xref_id = irx.id
  LEFT JOIN category AS c ON c.id = ircx.category_id
  GROUP BY i.id, c.id;

CREATE VIEW view_instance_organization AS
  SELECT
    i.id AS instance_id,
    i.name AS instance_name,
    o.id AS category_id,
    o.name AS category_name
  FROM instance AS i
  RIGHT JOIN instance_region_xref AS irx ON irx.region_id = i.id
  RIGHT JOIN instance_region_organization_xref AS irox ON irox.instance_region_xref_id = irx.id
  LEFT JOIN organization AS o ON o.id = irox.organization_id
  GROUP BY o.id, i.id;

CREATE MATERIALIZED VIEW view_instance_region_info AS
  WITH latest_category AS (
  	SELECT
      instance_id,
      region_id,
      array_agg(item ORDER BY (item->>'count')::integer DESC) AS grouped_data
    FROM (
  		SELECT DISTINCT ON (irx.region_id, irx.region_id, ircx.category_id)
        irx.instance_id,
        irx.region_id,
        json_build_object('name', c.name, 'count', count, 'update_date', update_date) AS item
  		FROM category_data AS cd
      LEFT JOIN instance_region_category_xref AS ircx ON ircx.id = cd.instance_region_category_xref_id
      LEFT JOIN instance_region_xref AS irx ON irx.id = ircx.instance_region_xref_id
  		LEFT JOIN category AS c ON c.id = ircx.category_id
  		ORDER BY irx.region_id, irx.region_id, ircx.category_id, update_date DESC
    ) AS sorted_data
  	GROUP BY instance_id, region_id
  ), latest_tag AS (
  	SELECT
      instance_id,
      region_id,
      array_agg(item ORDER BY (item->>'count')::integer DESC) AS grouped_data
    FROM (
  		SELECT DISTINCT ON (irx.region_id, irx.region_id, irtx.tag_id)
        irx.instance_id,
        irx.region_id,
        json_build_object('name', t.name, 'count', count, 'update_date', update_date) AS item
  		FROM tag_data AS td
      LEFT JOIN instance_region_tag_xref AS irtx ON irtx.id = td.instance_region_tag_xref_id
      LEFT JOIN instance_region_xref AS irx ON irx.id = irtx.instance_region_xref_id
  		LEFT JOIN tag AS t ON t.id = irtx.tag_id
      WHERE t.name <> ''
  		ORDER BY irx.region_id, irx.region_id, irtx.tag_id, update_date DESC
    ) AS sorted_data
  	GROUP BY instance_id, region_id
  ), latest_organization AS (
  	SELECT
      instance_id,
      region_id,
      array_agg(item ORDER BY (item->>'count')::integer DESC) AS grouped_data
    FROM (
  		SELECT DISTINCT ON (irx.instance_id, irx.region_id, irox.organization_id)
        irx.instance_id,
        irx.region_id,
        json_build_object('name', o.name, 'count', count, 'update_date', update_date) AS item
  		FROM organization_data AS od
      LEFT JOIN instance_region_organization_xref AS irox ON irox.id = od.instance_region_organization_xref_id
      LEFT JOIN instance_region_xref AS irx ON irx.id = irox.instance_region_xref_id
  		LEFT JOIN organization AS o ON o.id = irox.organization_id
  		ORDER BY irx.instance_id, irx.region_id, irox.organization_id, update_date DESC
    ) AS sorted_data
  	GROUP BY instance_id, region_id
  ), latest_data AS (
  	SELECT DISTINCT ON (instance_id, region_id)
      instance_id,
      region_id,
      count,
      update_date
  	FROM region_data AS rd
    LEFT JOIN instance_region_xref AS irx ON irx.id = rd.instance_region_xref_id
    ORDER BY instance_id, region_id, update_date DESC
  )
  SELECT
    i.id AS instance_id,
    i.name AS instance_name,
  	r.id AS region_id,
  	r.name AS region_name,
  	irl.level,
    rl.name AS level_name,
    ld.count,
    ld.update_date,
    COALESCE(lt.grouped_data, '{}') AS tags,
    COALESCE(lc.grouped_data, '{}') AS categories,
    COALESCE(lo.grouped_data, '{}') AS organizations
  FROM region AS r
  RIGHT JOIN instance_region_xref AS irx ON irx.region_id = r.id
  LEFT JOIN instance AS i ON irx.instance_id = i.id
  LEFT JOIN instance_region_level AS irl ON irx.instance_region_level_id = irl.id
  LEFT JOIN region_level AS rl ON irl.level = rl.id
  LEFT JOIN latest_data AS ld ON ld.region_id = r.id AND ld.instance_id = i.id
  LEFT JOIN latest_category AS lc ON lc.region_id = r.id AND lc.instance_id = i.id
  LEFT JOIN latest_tag AS lt ON lt.region_id = r.id AND lt.instance_id = i.id
  LEFT JOIN latest_organization AS lo ON lo.region_id = r.id AND lo.instance_id = i.id
  WHERE ld.update_date IS NOT NULL;
