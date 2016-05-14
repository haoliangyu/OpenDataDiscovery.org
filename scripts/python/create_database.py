import psycopg2 as pg
import subprocess

host = 'localhost'
port = '5432'
database = 'odd'
user = 'postgres'

# database schema file
schema_file = '../sql/open_data_discovery_schema.sql'

# remove the database if it alread exists
subprocess.call('dropdb -h %s -p %s -U %s %s' % (host, port, user, database), shell=True)

# creat the database
subprocess.call('createdb -h %s -p %s -U %s %s' % (host, port, user, database),shell=True)

# restore the schema
subprocess.call('psql -h %s -p %s -U postgres -d %s -f %s' %
                (host, port, database, schema_file), shell=True)

# insert instance data
conn = pg.connect('host=%s port=%s dbname=%s user=%s' % (host, port, database, user))
cur = conn.cursor()

# **************************************************************************** #
#                                 Data.gov
# **************************************************************************** #

# Boundaries of U.S (source: https://github.com/haoliangyu/us-boundary)
geom_database = 'us_boundary'
geom_conn = pg.connect('host=%s port=%s dbname=%s user=%s' %
                       (host, port, geom_database, user))
geom_cur = geom_conn.cursor()

# create instance
sql = 'INSERT INTO instance (name, url, description, crawl_schedule) VALUES (%s, %s, %s, %s) RETURNING *'
cur.execute(sql, ('Data.gov', 'http://catalog.data.gov', 'open data portal of us government', '* 1 * * 2'))
instance_id = cur.fetchone()[0]

# insert region level
cur.execute('INSERT INTO instance_region_level (instance_id, name, level) VALUES \
            (%s, \'Nation\', 0), (%s, \'State\', 1), (%s, \'County\', 2) RETURNING id',
            (instance_id, instance_id, instance_id))
region_level_ids = map(lambda result: result[0], cur.fetchall())

# get geometry of the nation
geom_cur.execute('SELECT ST_AsText(geom_20m), ST_AsText(bbox) FROM view_nation')
nation = geom_cur.fetchone()

# insert nation
cur.execute('INSERT INTO region (name, geom, bbox) VALUES \
            (\'United State\', ST_SetSRID(ST_GeomFromText(%s), 4326), ST_SetSRID(ST_GeomFromText(%s), 4326)) RETURNING id',
            (nation[0], nation[1]))
nation_id = cur.fetchone()[0]

# insert xref between isntance and nation
cur.execute('INSERT INTO instance_region_xref (instance_id, region_id, instance_region_level_id) \
            VALUES (%s, %s, %s)',
            [instance_id, nation_id, region_level_ids[0]])

# get geometry of states
geom_cur.execute('SELECT name, abbr, ST_AsText(geom_20m), ST_AsText(bbox) FROM view_states')
states = geom_cur.fetchall()

# insert state geom
for state in states:
    cur.execute('INSERT INTO region (name, geom, bbox) VALUES \
                (%s, ST_SetSRID(ST_GeomFromText(%s), 4326), ST_SetSRID(ST_GeomFromText(%s), 4326)) RETURNING id',
                (state[0], state[2], state[3]))
    state_id = cur.fetchone()[0]

    cur.execute('INSERT INTO instance_region_xref (instance_id, region_id, instance_region_level_id) \
                VALUES (%s, %s, %s)',
                [instance_id, state_id, region_level_ids[1]])

# get geometry of counties
geom_cur.execute('SELECT vc.name, abbr, ST_AsText(vc.geom_20m), ST_AsText(vc.bbox) \
                 FROM view_counties AS vc \
                 LEFT JOIN view_states AS vs ON vs.name = vc.state')
counties = geom_cur.fetchall()

# insert conuties
for county in counties:
    cur.execute('INSERT INTO region (name, geom, bbox) VALUES \
                (%s, ST_SetSRID(ST_GeomFromText(%s), 4326), ST_SetSRID(ST_GeomFromText(%s), 4326)) RETURNING id',
                ('%s, %s' % (county[0], county[1]), county[2], county[3]))
    county_id = cur.fetchone()[0]

    cur.execute('INSERT INTO instance_region_xref (instance_id, region_id, instance_region_level_id) \
                VALUES (%s, %s, %s)',
                [instance_id, county_id, region_level_ids[2]])

cur.execute('REFRESH MATERIALIZED VIEW view_instance_region;')

geom_cur.close()
geom_conn.close()

# clean connection
conn.commit()
cur.close()
conn.close()
