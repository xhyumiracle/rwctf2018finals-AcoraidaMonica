import aiohttp
from aiohttp import web
import asyncio
import hashlib
from datetime import datetime
import os
import json

token_list = []
addr_src = json.load(open('addr_src.json', 'r'))

async def handle_req(req):
    addr=req.match_info.get('addr')
    if addr not in addr_src.keys():
        return web.Response(text='no source code related')
    else:
        code = ''
        with open(addr_src[addr]+'.sol', 'r') as f:
            code=f.read()
        return web.Response(text=code)

app = web.Application()
app.router.add_route('*', '/{addr}', handle_req)
web.run_app(app, port=8091)
