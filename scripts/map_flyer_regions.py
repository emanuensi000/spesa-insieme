"""Riquadri verificati sulle pagine dell'edizione 946. Coordinate normalizzate.
Non riutilizzare queste mappe per altre edizioni o trascrizioni.
"""
import json
from pathlib import Path
path = Path('public/data/offers.json')
catalog = json.loads(path.read_text())
assert catalog['flyers'][0]['id'] == '946'

def grid(cols, rows, left, top, right, bottom):
    return [(left+(right-left)*c/cols, top+(bottom-top)*r/rows, (right-left)/cols, (bottom-top)/rows) for r in range(rows) for c in range(cols)]
def rect(x,y,r,b): return (x,y,r-x,b-y)
def standard(page,cols=7,rows=6): return grid(cols,rows,57 if page%2==0 else 27,126,1074 if page%2==0 else 1044,1036)
maps={}
for p in [3,4,15]: maps[p]=standard(p)
g=standard(2);maps[2]=g[:19]+[rect(784,430,1074,733)]+g[21:26]+g[28:]
g=standard(5);maps[5]=g[:12]+[rect(754,278,1044,429)]+g[14:19]+[rect(754,429,1044,580)]+g[21:]
g=standard(14);maps[14]=g[:3]+[rect(493,126,784,278)]+g[5:]
g=standard(16);maps[16]=g[:1]+[rect(202,126,493,278)]+g[3:]
g=standard(17);maps[17]=[rect(27,126,172,430)]+g[1:7]+g[8:]
g=standard(6,6);maps[6]=[rect(57,126,227,430)]+g[1:6]+g[7:18]+[g[18],rect(227,580,480,885),rect(480,580,735,885),g[22],g[23],g[24],g[28],g[29]]+g[30:]
g=standard(7,6);maps[7]=g[:6]+[rect(245,340,418,580),rect(418,278,535,580)]+g[9:12]+g[15:18]+g[18:]
maps[1]=[rect(5,440,197,675),rect(197,450,357,704),rect(357,455,532,704),rect(532,460,746,675),rect(5,675,166,920),rect(166,705,371,920),rect(371,705,532,920),rect(532,675,746,920),rect(754,488,1055,585),rect(754,585,938,719),rect(938,585,1055,865),rect(754,719,938,882)]
maps[8]=[rect(57,126,430,441),rect(430,126,800,441),rect(800,126,1074,441),rect(57,441,570,704),rect(570,441,1074,704),rect(57,704,550,1036),rect(550,704,1074,1036)]
maps[9]=grid(4,1,27,126,1044,360)+grid(4,1,27,360,1044,592)+grid(3,1,27,592,1044,776)+grid(7,1,27,776,1044,907)+[rect(27,907,172,1036),rect(172,907,462,1036)]+grid(4,1,462,907,1044,1036)
maps[10]=[rect(38,108,305,340),rect(305,108,570,340),rect(570,108,1100,340)]+grid(2,3,38,340,1100,1028)
maps[11]=[rect(0,108,530,340),rect(530,7,1062,340)]+grid(2,1,0,340,1062,570)+[rect(0,570,265,798),rect(265,570,530,798),rect(530,570,796,798),rect(796,570,1062,798),rect(0,798,530,1028)]+grid(2,2,530,798,1062,1050)
g=standard(12,6,5);maps[12]=[g[0],rect(227,126,566,308),g[3],g[4],rect(905,126,1074,490)]+g[6:11]+g[12:]
maps[13]=[rect(250,478,365,632)]+grid(4,3,365,126,1044,673)+[rect(27,673,365,855)]+grid(4,1,365,673,1044,855)+[rect(27,855,260,1036),rect(260,855,510,1036),rect(592,855,818,1036),rect(818,855,1044,1036)]
g=standard(18);maps[18]=[rect(57,126,347,278)]+g[2:7]+g[7:12]+[rect(784,278,1074,430)]+g[14:21]+[rect(57,580,493,885)]+g[24:28]+g[31:33]+[rect(784,733,929,1036),rect(929,733,1074,1036)]+g[35:40]
g=standard(19);maps[19]=g[:28]+grid(5,2,317,768,1044,1036)
for page, boxes in maps.items():
    offers=[o for o in catalog['offers'] if o['page']==page]
    assert len(offers)==len(boxes),(page,len(offers),len(boxes))
    for offer,box in zip(offers,boxes): offer['region']=[round(v/d,6) for v,d in zip(box,(1100,1092,1100,1092))]
for offer in catalog['offers']: offer['local_page'] = catalog['flyers'][0]['local_pages'][offer['page']-1]
Path('data/flyer-regions-946.json').write_text(json.dumps({o['id']:o['region'] for o in catalog['offers']},ensure_ascii=False,indent=2)+'\n')
path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
print(f'Mappati {sum(map(len,maps.values()))} prodotti su {len(maps)} pagine')
