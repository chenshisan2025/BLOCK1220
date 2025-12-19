import fs from "node:fs";
import path from "node:path";

export function exists(p) {
  return fs.existsSync(path.resolve(process.cwd(), p));
}

export function read(p) {
  return fs.readFileSync(path.resolve(process.cwd(), p), "utf8");
}

export function stat(p) {
  return fs.statSync(path.resolve(process.cwd(), p));
}

export function list(dir) {
  return fs.readdirSync(path.resolve(process.cwd(), dir), { withFileTypes: true });
}

export function walk(dir, filter) {
  const root = path.resolve(process.cwd(), dir);
  const out = [];
  function rec(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) rec(full);
      else {
        if (!filter || filter(full)) out.push(full);
      }
    }
  }
  if (fs.existsSync(root)) rec(root);
  return out;
}

export function hexInContent(content) {
  const re = /#[0-9a-fA-F]{3,6}\b/g;
  return re.test(content);
}

export function logPass(msg) {
  console.log(msg);
}

export function logFail(msg) {
  console.error(msg);
}

export function fail(msg) {
  console.error(msg);
  process.exit(1);
}

export function ok(msg) {
  console.log(msg);
}

export function result(ok) {
  if (ok) {
    console.log("Validation Result: PASS");
    process.exit(0);
  } else {
    console.log("Validation Result: FAIL");
    process.exit(1);
  }
}
