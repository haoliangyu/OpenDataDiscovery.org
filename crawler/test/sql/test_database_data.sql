-- test instance and region
INSERT INTO instance (name) VALUES ('test instance');
INSERT INTO region (name, region_level_id, bbox, geom) VALUES ('test region', 0, ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[-191.95312499999997,-78.97138592818217],[-191.95312499999997,84.05256097843035],[185.625,84.05256097843035],[185.625,-78.97138592818217],[-191.95312499999997,-78.97138592818217]]]}'), 4326), ST_SetSRID(ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[[[-191.95312499999997,-78.97138592818217],[-191.95312499999997,84.05256097843035],[185.625,84.05256097843035],[185.625,-78.97138592818217],[-191.95312499999997,-78.97138592818217]]]]}'), 4326));

INSERT INTO instance_region_xref (instance_id, region_id) VALUES
((SELECT id FROM instance WHERE name = 'test instance'), (SELECT id FROM region WHERE name = 'test region'));

-- test tag
WITH new_tag AS (
  INSERT INTO tag (name) VALUES ('test tag') RETURNING id
)
INSERT INTO instance_tag_xref (tag_id, instance_id) (
  SELECT new_tag.id, (SELECT id FROM instance WHERE name = 'test instance') FROM new_tag
);

-- tag data
INSERT INTO tag_data (instance_tag_xref_id, count, create_date, update_date) (
  SELECT itx.id, 100, now(), now() FROM instance_tag_xref AS itx
  LEFT JOIN tag AS t ON t.id = itx.tag_id
  WHERE t.name = 'test tag'
);

REFRESH MATERIALIZED VIEW view_instance_region;
