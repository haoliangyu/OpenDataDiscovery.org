-- Clear test tag data
DELETE FROM tag_data WHERE instance_region_tag_xref_id IN (
  SELECT irtx.id FROM instance_region_tag_xref AS irtx
  LEFT JOIN tag AS t ON t.id = irtx.tag_id
  WHERE t.name = 'test tag'
);
DELETE FROM instance_region_tag_xref WHERE tag_id IN (
  SELECT id FROM tag WHERE name = 'test tag'
);
DELETE FROM tag WHERE name = 'test tag';

-- Clear test category data
DELETE FROM category_data WHERE instance_region_category_xref_id IN (
  SELECT ircx.id FROM instance_region_category_xref AS ircx
  LEFT JOIN category AS c ON c.id = ircx.category_id
  WHERE c.name = 'test category'
);
DELETE FROM instance_region_category_xref WHERE category_id IN (
  SELECT id FROM category WHERE name = 'test category'
);
DELETE FROM category WHERE name = 'test category';

-- Clear test organization data
DELETE FROM organization_data WHERE instance_region_organization_xref_id IN (
  SELECT irox.id FROM instance_region_organization_xref AS irox
  LEFT JOIN organization AS o ON o.id = irox.organization_id
  WHERE o.name = 'test organization'
);
DELETE FROM instance_region_organization_xref WHERE organization_id IN (
  SELECT id FROM organization WHERE name = 'test organization'
);
DELETE FROM organization WHERE name = 'test organization';

-- Clear region data
DELETE FROM region_data WHERE instance_region_xref_id IN (
  SELECT irx.id FROM instance_region_xref AS irx
  LEFT JOIN instance AS i ON i.id = irx.instance_id
  WHERE i.name = 'test instance'
);

-- Clear instance region xref
DELETE FROM instance_region_xref WHERE region_id IN (
  SELECT id FROM region WHERE name = 'test region'
);

-- Clear region
DELETE FROM region WHERE name = 'test region';

-- Clear instance
DELETE FROM instance WHERE name = 'test instance';

REFRESH MATERIALIZED VIEW view_instance_region;
