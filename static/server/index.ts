import path = require("path");
import * as fs from "fs";
import * as http from "http";

type Request = http.IncomingMessage | { url: string };
type Response = http.ServerResponse;

const hostname = "127.0.0.1";
const port = 3000;
const dirPublic = "./server";
const indexFile = "index.html";

const service = function (req: Request, res: Response) {
  const pathname = req.url;
  const root = path.resolve(dirPublic);
  const file = path.join(root, pathname);

  fs.stat(file, (err, stat) => {
    if (err) {
      console.log("err", err);
      res.write("err");
      res.end();
      return;
    }

    if (stat.isDirectory()) {
      service({ url: `${req.url}/${indexFile}` }, res);
    }

    if (stat.isFile()) {
      const stream = fs.createReadStream(file);
      stream.pipe(res);
    }
  });
};

const listener = function (req: Request, res: Response) {
  service(req, res);
};

const server = http.createServer(listener);
server.listen(port, hostname);
