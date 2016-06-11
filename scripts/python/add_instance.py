import os
import json
import subprocess
import psycopg2 as pg

# **************************************************************************** #
#                               Data Input                                     #
# **************************************************************************** #

# geojson file paths
geometry_path = '../data/boundary.geojson'
bbox_path = '../data/bbox.geojson'

# instance info
name = 'Alagoas Data and Information'
url = 'http://dados.al.gov.br'
description = 'Open Data for the Alagoas Government'
location = 'Alagoas, Brazil'
schedule = '* 1 * * 3'

# region level
region = 'State'
region_level = 0

# **************************************************************************** #
#                               Database                                       #
# **************************************************************************** #

conn = pg.connect('host=localhost dbname=odd user=postgres')
cur = conn.cursor()

boundary = json.loads(open(geometry_path).read())['features'][0]['geometry']
bbox = json.loads(open(bbox_path).read())['features'][0]['geometry']

# insert instance
sql = 'INSERT INTO instance (name, url, description, crawl_schedule, location) VALUES \
        (%s, %s, %s, %s, %s) RETURNING *'
cur.execute(sql, [name, url, description, schedule, location])
instance_id = cur.fetchone()[0]

# insert region level
cur.execute('INSERT INTO instance_region_level (instance_id, name, level) VALUES \
            (%s, %s, %s) RETURNING id',
            (instance_id, region, region_level))
region_level_id = cur.fetchone()[0]

# insert boundary and bbox
cur.execute('INSERT INTO region (name, geom, bbox) VALUES \
            (%s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326), ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326)) RETURNING id',
            (location, json.dumps(boundary), json.dumps(bbox)))
nation_id = cur.fetchone()[0]

# insert xref between isntance and nation
cur.execute('INSERT INTO instance_region_xref (instance_id, region_id, instance_region_level_id) \
            VALUES (%s, %s, %s)',
            [instance_id, nation_id, region_level_id])

conn.commit()

# update database
cur.execute('REFRESH MATERIALIZED VIEW view_instance_region')
conn.commit()

# backup
directory = os.path.dirname(os.path.realpath(__file__))
subprocess.call('bash %s/../bash/dump_instance.sh' % directory, shell=True)

cur.close()
conn.close()
