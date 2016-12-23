CREATE EXTENSION postgis;

CREATE TABLE api (
  id serial PRIMARY KEY,
  name text NOT NULL
);

INSERT INTO api (name) VALUES ('export');

CREATE TABLE api_usage (
  id serial PRIMARY KEY,
  api_id integer REFERENCES api (id),
  request_time timestamp DEFAULT now()
);

CREATE TABLE platform {
  id serial PRIMARY KEY,
  name text,
  url text
};

CREATE TABLE instance (
  id serial PRIMARY KEY,
  name text,
  url text,
  description text,
  active boolean DEFAULT true,
  platform_id integer
);

CREATE TABLE region (
  id serial PRIMARY KEY,
  name text,
  geom geometry(MULTIPOLYGON, 4326),
  bbox geometry(POLYGON, 4326),
  center geometry(POINT, 4326),
  region_level_id integer
);

CREATE TABLE instance_region_xref (
  id serial PRIMARY KEY,
  instance_id integer,
  region_id integer
);

CREATE TABLE region_level (
  id serial PRIMARY KEY,
  name text,
  max_tile_zoom integer,
  min_tile_zoom integer
);

INSERT INTO region_level (id, name) VALUES
(0, 'Continent'),
(1, 'Nation'),
(2, 'Provice/State'),
(3, 'Megalopolis'),
(4, 'City');

CREATE TABLE instance_data (
  id serial PRIMARY KEY,
  instance_id integer,
  count integer,
  create_date date,
  update_date date
);

CREATE INDEX instance_data_update_date_idx ON instance_data (update_date);
CREATE INDEX instance_id_idx ON region_data (instance_id);

CREATE TABLE tag (
  id serial PRIMARY KEY,
  name text
);

CREATE TABLE instance_tag_xref (
  id serial PRIMARY KEY,
  tag_id integer,
  instance_id integer
);

CREATE INDEX instance_tag_xref_id_idx ON instance_tag_xref (instance_id);

CREATE TABLE tag_data (
  id serial PRIMARY KEY,
  instance_tag_xref_id integer,
  count integer,
  create_date date,
  update_date date
);

CREATE INDEX tag_data_update_date_idx ON tag_data (update_date);
CREATE INDEX tag_data_count_idx ON tag_data (count);

CREATE TABLE category (
  id serial PRIMARY KEY,
  name text
);

CREATE TABLE instance_category_xref (
  id serial PRIMARY KEY,
  category_id integer,
  instance_id integer
);

CREATE INDEX instance_category_xref_id_idx ON instance_category_xref (instance_id);

CREATE TABLE category_data (
  id serial PRIMARY KEY,
  instance_category_xref_id integer,
  count integer,
  create_date date,
  update_date date
);

CREATE INDEX category_data_update_date_idx ON category_data (update_date);
CREATE INDEX category_data_count_idx ON category_data (count);

CREATE TABLE organization (
  id serial PRIMARY KEY,
  name text
);

CREATE TABLE instance_organization_xref (
  id serial PRIMARY KEY,
  organization_id integer,
  instance_id integer
);

CREATE INDEX instance_organization_xref_id_idx ON instance_organization_xref (instance_id);

CREATE TABLE organization_data (
  id serial PRIMARY KEY,
  instance_organization_xref_id integer,
  count integer,
  create_date date,
  update_date date
);

CREATE INDEX organization_data_update_date_idx ON organization_data (update_date);
CREATE INDEX organization_data_count_idx ON organization_data (count);

CREATE VIEW view_api_usage AS
  SELECT a.id, a.name, COUNT(au.id)
  FROM api_usage AS au
    LEFT JOIN api AS a ON a.id = au.api_id
  GROUP BY a.id, a.name;

CREATE MATERIALIZED VIEW view_instance_region AS
  SELECT r.id AS region_id,
    CASE
        WHEN rl.name = 'Globe' THEN rl.name
        WHEN rl.name = 'Continent' THEN r.continent
        WHEN rl.name = 'City' THEN array_to_string(array_remove(ARRAY[r.city, r.province], NULL::text), ', '::text)
        WHEN rl.name = 'Region/County' THEN array_to_string(array_remove(ARRAY[r.region, r.province], NULL::text), ', '::text)
        ELSE array_to_string(array_remove(ARRAY[r.city, r.region, r.province, r.country], NULL::text), ', '::text)
    END AS region_name,
    rl.id AS level,
    rl.name AS level_name,
    i.id AS instance_id,
    i.name AS instance_name,
    r.geom,
    r.bbox
   FROM instance i
     RIGHT JOIN instance_region_xref irx ON i.id = irx.instance_id
     LEFT JOIN region r ON r.id = irx.region_id
     LEFT JOIN region_level rl ON rl.id = r.region_level_id
  WHERE i.active;

CREATE INDEX view_instance_region_geom_idx ON view_instance_region USING gist(geom);

CREATE MATERIALIZED VIEW view_instance_info AS
  WITH latest_category AS (
         SELECT icx.instance_id,
            array_agg(json_build_object('name', c.name, 'count', sorted_data.count, 'update_date', sorted_data.update_date) ORDER BY sorted_data.count DESC) AS grouped_data
           FROM ( SELECT DISTINCT ON (cd.instance_category_xref_id) cd.instance_category_xref_id,
                    cd.count,
                    cd.update_date
                   FROM category_data cd
                  ORDER BY cd.instance_category_xref_id, cd.update_date DESC) sorted_data
             LEFT JOIN instance_category_xref icx ON icx.id = sorted_data.instance_category_xref_id
             LEFT JOIN category c ON c.id = icx.category_id
          GROUP BY icx.instance_id
        ), latest_tag AS (
         SELECT itx.instance_id,
            array_agg(json_build_object('name', t.name, 'count', sorted_data.count, 'update_date', sorted_data.update_date) ORDER BY sorted_data.count DESC) AS grouped_data
           FROM ( SELECT DISTINCT ON (td.instance_tag_xref_id) td.instance_tag_xref_id,
                    td.count,
                    td.update_date
                   FROM tag_data td
                  ORDER BY td.instance_tag_xref_id, td.update_date DESC) sorted_data
             LEFT JOIN instance_tag_xref itx ON itx.id = sorted_data.instance_tag_xref_id
             LEFT JOIN tag t ON t.id = itx.tag_id
          GROUP BY itx.instance_id
        ), latest_organization AS (
         SELECT iox.instance_id,
            array_agg(json_build_object('name', o.name, 'count', sorted_data.count, 'update_date', sorted_data.update_date) ORDER BY sorted_data.count DESC) AS grouped_data
           FROM ( SELECT DISTINCT ON (od.instance_organization_xref_id) od.instance_organization_xref_id,
                    od.count,
                    od.update_date
                   FROM organization_data od
                  ORDER BY od.instance_organization_xref_id, od.update_date DESC) sorted_data
             LEFT JOIN instance_organization_xref iox ON iox.id = sorted_data.instance_organization_xref_id
             LEFT JOIN organization o ON o.id = iox.organization_id
          GROUP BY iox.instance_id
        ), latest_data AS (
         SELECT DISTINCT ON (instance_data.instance_id) instance_data.instance_id,
            instance_data.count,
            instance_data.update_date
           FROM instance_data
          ORDER BY instance_data.instance_id, instance_data.update_date DESC
        )
  SELECT i.id AS instance_id,
    i.name AS instance_name,
    i.description,
    vir.region_id,
    vir.region_name,
    vir.level,
    vir.level_name,
    ld.count,
    ld.update_date,
    p.id AS platform_id,
    p.name AS platform_name,
    COALESCE(lt.grouped_data, '{}'::json[]) AS tags,
    COALESCE(lc.grouped_data, '{}'::json[]) AS categories,
    COALESCE(lo.grouped_data, '{}'::json[]) AS organizations
   FROM instance i
    LEFT JOIN platform p ON p.id = i.platform_id
    LEFT JOIN view_instance_region vir ON vir.instance_id = i.id
    LEFT JOIN latest_data ld ON ld.instance_id = i.id
    LEFT JOIN latest_category lc ON lc.instance_id = i.id
    LEFT JOIN latest_tag lt ON lt.instance_id = i.id
    LEFT JOIN latest_organization lo ON lo.instance_id = i.id
  WHERE i.active;
