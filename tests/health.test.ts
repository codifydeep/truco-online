import {test,expect} from "vitest";
import {buildApp} from "../server/app.js";
test("GET /health returns 200 with status ok", async()=>{
  const app=buildApp();
  try{
    const r=await app.inject({method:"GET",url:"/health"});
    expect(r.statusCode).toBe(200);
    expect(r.json()).toEqual({status:"ok"});
  } finally { await app.close(); }
});
