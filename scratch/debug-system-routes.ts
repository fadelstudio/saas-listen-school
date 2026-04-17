import { systemRouter } from "../src/modules/system/system.route";

type Layer = {
  route?: { path?: string; methods?: Record<string, boolean> };
  name?: string;
  handle?: any;
};

const stack = (systemRouter as any).stack as Layer[];
const routes = stack
  .map((l) => l.route)
  .filter(Boolean)
  .map((r) => ({
    path: r?.path,
    methods: r?.methods ? Object.keys(r.methods).filter((m) => r.methods?.[m]) : [],
  }));

console.log(JSON.stringify(routes, null, 2));

