import express from "express";
import "dotenv/config";
import cors from "cors";
import router from "./routes/puzzles.js";

const app = express();
const { CORS_ORIGIN, PORT } = process.env;

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.use("/getChessPuzzle", router);

app.get("/", (req, res) => {
  res.send(
    "Welcome to the InStock API. To access warehouses data go to <strong>/warehouses.</strong> To access inventories data go to <strong>/inventories.</strong>"
  );
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT} :)`);
});
