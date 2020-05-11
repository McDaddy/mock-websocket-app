const express = require("express");
const sockjs = require("sockjs");
const http = require("http");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let wsConn = null;
let wsServer = null;
let wsHttpServer = null;
let selfConn = null;

app.post("/connect", function (req, res) {
  if (wsConn) {
    wsConn.close();
    // wsServer && wsServer.close();
  }
  if (wsHttpServer) {
    wsHttpServer.close();
  }

  const { wsUrl } = req.body;
  const wsServer = sockjs.createServer();
  wsServer.on("connection", function (conn) {
    wsConn = conn;
    selfConn.write(JSON.stringify({ clientConnected: true }))
    // conn.on("data", function (message) {});
    // conn.on("close", function () {});
  });
  const server = http.createServer();
  wsServer.installHandlers(server, { prefix: wsUrl || "/api/fdp/ws" });
  server.listen(9999, "0.0.0.0");
  wsHttpServer = server;
  res.send({ success: true });
});

const selfWs = sockjs.createServer();
selfWs.on("connection", function (conn) {
    selfConn = conn;
});
const server = http.createServer();
selfWs.installHandlers(server, { prefix: "/mock/ws" });
server.listen(9998, "0.0.0.0");

const defaultPayload = {
  scope: {
    type: "CDP", // 区分数据湖和CDP
    clusterId: 1, // 集群Id
  },
  type: "AD_HOC_QUERY_DONE", // 表示事件类型， 将来可以用来扩展其他所有需要ws的类型
  payload: {
    errors: null, // 如果有错误在这里返回
    queryId: 1000,
    dataSourceName: "abc",
    dataSourceId: 123,
    userId: 2,
  },
};

app.post("/mockMessage", (req, res) => {
  const { content } = req.body;
  console.log("content", content)
  if (wsConn) {
      wsConn.write(JSON.stringify(content || defaultPayload));
  }
});

app.listen(8000);
