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
sql = 'INSERT INTO instance (name, url, description) VALUES (%s, %s, %s) RETURNING *'
cur.execute(sql, ('Data.gov', 'http://www.data.gov/', 'open data portal of us government'))
instance_id = cur.fetchone()[0]

# insert region level
cur.execute('INSERT INTO region_level (instance_id, name) VALUES \
            (%s, \'Nation\'), (%s, \'State\'), (%s, \'County\') RETURNING *',
            (instance_id, instance_id, instance_id))
region_level_ids = map(lambda result: result[0], cur.fetchall())

# get geometry of the nation
geom_cur.execute('SELECT ST_AsText(geom_20m), ST_AsText(bbox) FROM view_nation')
nation = geom_cur.fetchone()

# insert nation
cur.execute('INSERT INTO region (name, level_id, geom, bbox) VALUES \
            (\'United State\', %s, ST_SetSRID(ST_GeomFromText(%s), 4326), ST_SetSRID(ST_GeomFromText(%s), 4326))',
            (region_level_ids[0], nation[0], nation[1]))

# get geometry of states
geom_cur.execute('SELECT name, abbr, ST_AsText(geom_20m), ST_AsText(bbox) FROM view_states')
states = geom_cur.fetchall()

# insert state geom
for state in states:
    cur.execute('INSERT INTO region (name, level_id, geom, bbox) VALUES \
                (%s, %s, ST_SetSRID(ST_GeomFromText(%s), 4326), ST_SetSRID(ST_GeomFromText(%s), 4326))',
                (state[0], region_level_ids[1], state[2], state[3]))

# get geometry of counties
geom_cur.execute('SELECT vc.name, abbr, ST_AsText(vc.geom_20m), ST_AsText(vc.bbox) \
                 FROM view_counties AS vc \
                 LEFT JOIN view_states AS vs ON vs.name = vc.state')
counties = geom_cur.fetchall()

# insert conuties
for county in counties:
    cur.execute('INSERT INTO region (name, level_id, geom, bbox) VALUES \
                (%s, %s, ST_SetSRID(ST_GeomFromText(%s), 4326), ST_SetSRID(ST_GeomFromText(%s), 4326))',
                ('%s, %s' % (county[0], county[1]), region_level_ids[2], county[2], county[3]))

geom_cur.close()
geom_conn.close()

# clean connection
conn.commit()
cur.close()
conn.close()
