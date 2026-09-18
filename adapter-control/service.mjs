// Controller-owned rehearsal harness, not product code or proof of deploy.
import {createServer} from 'node:http';
import {capacity} from './src/app.mjs';
const commit=process.env.APP_COMMIT;
if(!/^[a-f0-9]{40}$/.test(commit??'')) throw new Error('Exact deployed commit required');
createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  let status=200,body;
  if(url.pathname==='/health') body={status:'ok',commit};
  else if(url.pathname==='/capacity') {
    const values=url.searchParams.getAll('n');
    if(values.length!==1||[...url.searchParams.keys()].some(k=>k!=='n')||! /^-?\d+$/.test(values[0])||!Number.isSafeInteger(Number(values[0]))) {
      status=400;body={error:'invalid player count',commit};
    } else body={capacity:capacity(Number(values[0])),commit};
  } else {status=404;body={error:'not found',commit};}
  res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(body));
}).listen(8080,'0.0.0.0');
