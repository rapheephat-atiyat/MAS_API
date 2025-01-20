const express = require("express");
const { WebSocketServer } = require("ws");
const http = require("http");
const path = require("path");

const app = express();
const server = http.createServer(app);

class MAS {
    /**
     * โปรแกรมนับจำนวนคน BY Mas ครับผม
     */
    constructor() {
        this.count = 0;
    }

    /**
     * @returns {void}
     */
    increment() {
        this.count++;
    }

    /**
     * @returns {void}
     * @param {number} value 
     */
    decrement(value) {
        this.count -= value; 
    }

    /**
     * @returns {number}
     */
    getCount() {
        return this.count;
    }

    /**
     * @returns {void}
     */
    reset() {
        this.count = 0;
    }
}

const Mas = new MAS();

app.use(express.static(path.join(__dirname, "public")));

const wss = new WebSocketServer({ server, host: '0.0.0.0' });

wss.on("connection", (ws) => {
    console.log(`[ + ] New WebSocket connection established`);
    ws.send(JSON.stringify({ type: "test", message: "Connected to WebSocket server!" }));

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);
            switch (data.type) {
                case "MAS":
                    if (data.action == "increment") {
                        Mas.increment();
                        broadcastMASData()
                    } else if(data.action == "decrement") {
                        Mas.decrement(data.value);
                        broadcastMASData()
                    }  else if(data.action == "reset") {
                        Mas.reset();
                        broadcastMASData()
                    } else if(data.action == "conn") {
                        ws.send(JSON.stringify({ type: "MAS", message: "MAS triggered!", data: Mas.getCount() }));
                    }
                    break;
                default:
                    ws.send(JSON.stringify({ type: "error", message: "Invalid type!" }));
            }
        } catch (err) {
            ws.send(JSON.stringify({ type: "error", message: "Invalid message format!" }));
        }
    });
});

function broadcastMASData() {
    const message = JSON.stringify({ type: "MAS", message: "MAS triggered!", data: Mas.getCount() });
    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    });
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`[ i ] Server is running on http://localhost:${PORT}`);
});
