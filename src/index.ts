import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());
const prisma = new PrismaClient();

app.get("/products", async (req, res) => {
  const sortByViews = req.query.sortByViews;
  const limit = Number(req.query.limit) || undefined;
  console.log(sortByViews);

  const products = await prisma.product.findMany({
    orderBy: {
      views: sortByViews as any,
    },
    take: limit,
  });
  res.send(products);
})

app.post("/users", async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: {
        email: req.body.email,
        lastName: req.body.lastName,
        name: req.body.name,
        password: req.body.password
      }
    })
    res.send(user);
  } catch {
    res.status(500).send({ error: true });
  }
})

app.listen(3000, () => {
  console.log("si");
});
