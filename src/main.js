import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import { resolve } from "node:path";
import express from "express";
import cors from "cors";
import { globalErrorHandling } from "./middleware/error.middleware.js";
import { userModule, messageModule, authenticationModule } from "./modules/index.js";
import { bootstrapDB } from "./DB/connections.js";
import { ORIGINS, PORT } from "./config.js";
import { generateLimiter, sendEmail, successResponce } from "./common/utils/index.js";
import helmet from "helmet";
import morgan from "morgan";
const app = express();
const port = PORT;
await bootstrapDB(app, port);

app.set("trust proxy", true);

// allow frontend to access apis
var corsOptions = {
  origin: function (origin, callback) {
    if (!ORIGINS.includes(origin)) {
      callback(new Error("unauthorized origin", { cause: { status: 401 } }));
    } else {
      callback(null, ORIGINS);
    }
  },
};

const limiter = generateLimiter({});

app.use(cors(), helmet(), morgan("dev"), limiter, express.json());

app.use("/assets", express.static("./assets"));

app.get("/", (req, res, next) => {
  res.send({ message: "Welcome to saraha app" });
});

app.use("/auth", authenticationModule);
app.use("/user", userModule);
app.use("/message", messageModule);

app.use("{/*dummy}", (req, res) => res.status(404).send({ message: "Invalid app router" }));

app.use(globalErrorHandling);
