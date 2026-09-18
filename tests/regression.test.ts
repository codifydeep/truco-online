import {test,expect} from "vitest";
import {buildApp} from "../server/app.js";
test("unknown routes stay 404", async()=>{const app=buildApp();try{const r=await app.inject({method:"GET",url:"/not-a-route"});expect(r.statusCode).toBe(404);}finally{await app.close();}});
