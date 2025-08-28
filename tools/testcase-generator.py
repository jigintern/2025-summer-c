import json
import random

from cryptography.hazmat.primitives.hashes import SHA256
import hashlib
years = list(range(1900,2101))
xrange = [122,147]
yrange = [24,45]
a = []
for i in range(10):
    y1 = random.choice(years)
    y2 = random.choice(years)
    data = {
        "id" : hashlib.sha256(f'{i}'.encode()).hexdigest(),
        "name" : f'{i}',
        "geometry": {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[random.randint(xrange[0], xrange[1]) + random.random(),
                                 random.randint(yrange[0], yrange[1]) + random.random()] for i in
                                range(random.randint(3, 20))]]
            },
        },
        "decade":{
            "gt" : min(y1,y2),
            "lte" : max(y1,y2)+1,
        },
        "comment": "a",
        "photos": [],
        "thread": [],
        "created_at": "2020-01-01"
    }
    print(data)
    a.append(data)

with open("./testcase.json","w") as f:
    json.dump(a,f)