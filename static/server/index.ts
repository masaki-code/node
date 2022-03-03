import { Readable } from "stream";
import path = require("path");
import * as fs from "fs";
import * as http from "http";

type Request = http.IncomingMessage | { url: string; headers: any };
type Response = http.ServerResponse;

const hostname = "127.0.0.1";
const port = 3000;
const autoIndexFile = "index.html";

const service = function (req: Request, res: Response) {
  const pathname = req.url;

  const root = path.join(path.resolve("."), "server");
  let file = path.normalize(path.join(root, pathname));

  fs.stat(file, (err, stat) => {
    if (err) {
      console.log("err", err);
      res.write("err");
      res.end();
      return;
    }

    if (stat.isFile()) {
      const bytes = fs.readFileSync(file);
      const stream = Readable.from(bytes);
      stream.pipe(res);
      stream.on("close", () => {
        stream.destroy();
      });
    }

    if (stat.isDirectory()) {
      service(
        {
          url: `${req.url}/${autoIndexFile}`,
          headers: req.headers,
        },
        res
      );
    }
  });
};

const listener = function (req: Request, res: Response) {
  if (req.url === "/favicon.ico") {
    return;
  }

  service(req, res);
};

const server = http.createServer(listener);
server.listen(port, hostname);
