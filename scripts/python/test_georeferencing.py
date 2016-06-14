# This script is to test whether a CKAN portal has georeferenced data. It randomly
# generates multiple geographic boundary boxes for data search with API. If the
# return data count is different from the total data count in the portal, it
# can confirm some data is georeferenced.

import time
import random
import requests

# portal info
base_url = 'https://open.alberta.ca'
bbox = [-119.970703125, 48.922499263758255, -109.9072265625, 59.99898612060444]

# config
test_count = 20
wait = 1

# get total count
response = requests.get('%s/api/3/action/package_search?rows=0' % base_url).json()
total_count = response['result']['count']

result = True

for i in range(test_count):
    lower_lng = bbox[0] + (bbox[2] - bbox[0]) * random.random()
    lower_lat = bbox[1] + (bbox[3] - bbox[1]) * random.random()
    upper_lng = lower_lng + (bbox[2] - lower_lng) * random.random()
    upper_lat = lower_lat + (bbox[3] - lower_lat) * random.random()

    response = requests.get('%s/api/3/action/package_search?rows=0&ext_bbox=%f,%f,%f,%f' % \
                            (base_url, lower_lng, lower_lat, upper_lng, upper_lat)).json()
    count = response['result']['count']

    this_result = count != total_count
    result = result and this_result

    print('[Test %d] Has different data count? %s' % (i + 1, \
                                                      'Yes' if this_result else 'No'))
    time.sleep(1)

print('Does this portal have georeferenced data? %s' % ('Yes' if result else 'No'))
