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
name = 'Dados.gov.br'
url = 'http://dados.gov.br'
description = 'Brazilian national portal'
location = 'Brazil'
schedule = '* 1 * * 3'

# region level
region = 'Nation'
region_level = 0

# vetor tile layer
layer_name = 'dados_gov_br'

# **************************************************************************** #
#                               Database                                       #
# **************************************************************************** #

conn = pg.connect('host=52.87.229.42 port=5432 dbname=odd user=odd_admin password=Bko9tu39')
cur = conn.cursor()

boundary = json.loads(open(geometry_path).read())['features'][0]['geometry']
bbox = json.loads(open(bbox_path).read())['features'][0]['geometry']

# insert instance
sql = 'INSERT INTO instance (name, url, description, crawl_schedule, location) VALUES \
        (%s, %s, %s, %s, %s) RETURNING *'
cur.execute(sql, [name, url, description, schedule, location])
instance_id = cur.fetchone()[0]

# insert region level
cur.execute('INSERT INTO instance_region_level (instance_id, name, level, layer_name) VALUES \
            (%s, %s, %s, %s) RETURNING id',
            (instance_id, region, region_level, layer_name))
region_level_id = cur.fetchone()[0]

# convert Polygon to MultiPolygon
if boundary['type'] == 'Polygon':
    boundary['type'] = 'MultiPolygon'
    boundary['coordinates'] = [boundary['coordinates']]

# insert boundary and bbox
cur.execute('INSERT INTO region (name, geom, bbox) VALUES \
            (%s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326), ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326)) RETURNING id',
            (location, json.dumps(boundary), json.dumps(bbox)))
nation_id = cur.fetchone()[0]

# insert xref between isntance and nation
cur.execute('INSERT INTO instance_region_xref (instance_id, region_id, instance_region_level_id) \
            VALUES (%s, %s, %s)',
            [instance_id, nation_id, region_level_id])

# refresh region
cur.execute('REFRESH MATERIALIZED VIEW view_instance_region')

conn.commit()

# backup
# python.subprocess seems to be broken at Ubuntu 16.04. Need to wait for a fix
# directory = os.path.dirname(os.path.realpath(__file__))
# subprocess.call('bash %s/../bash/dump_instance.sh' % directory, shell=True)

cur.close()
conn.close()
