import http from 'http';
import {promises as fs} from 'fs';
import { fileURLToPath } from 'url';
import { dirname, extname } from 'path';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const host = 'localhost';
const port = 8080;
const os = process.platform;
const startUrl = `http://${host}:${port}/index.html`

let cmd;
if (os === "win32") {
// Windows
cmd = `start ${startUrl}`;
} else if (os === "darwin") {
// Mac OS
cmd = `open ${startUrl}`;
} else if (os === "linux") {
// Linux
cmd = `xdg-open ${startUrl}`;
} else {
// Unsupported OS
throw new Error("Unsupported operating system");
}

var contentTypesByExtension = {
    '.html': "text/html",
    '.css':  "text/css",
    '.js':   "text/javascript"
  };

const requestListener = function (req, res) {

    if(req){
        var url = req.url;
        if (url === "/")  url = '/index.html'
        fs.readFile(__dirname + "/src" + url).then(contents => {
            console.log("serving:","/src" + url);
            var headers = {};
            headers["Content-Type"] = contentTypesByExtension[extname(url)] || 'text/plain';
            res.writeHead(200, headers);
            res.write(contents);
            return res.end();
        }).catch(err => {
            console.error(err)
            res.writeHead(500);
            res.end(err);
            return;
        });
    }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
    exec(cmd);
});