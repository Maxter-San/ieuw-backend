import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
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

app.listen(3000, () => {
  console.log("si");
});
