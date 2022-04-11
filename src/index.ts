import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { idText } from "typescript";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const prisma = new PrismaClient({log: ['query']});

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

app.post("/productsViewed", async (req, res) => {
  try{
    //const limit = Number(req.query.limit) || undefined;

    const products = await prisma.product.findMany({
      orderBy: {
        id: 'desc',
      },
      take: 3,
      where: {
        viewedProducts: {
          some: {
            user: {
              id: Number(req.body.userId),
            }
          },
        },
      },
    });
    res.send(products);
  }
  catch{
    res.status(500).send({ error: true });
  }
})

app.post("/productViewed", async (req, res) => {
  try{
    const product = await prisma.product.findMany({
      where: {
        id: Number(req.body.productId),
      },
    });

    res.send(product);
  }
  catch{
    res.status(500).send({ error: true });
  }
})

app.get("/product/:productId", async (req, res) => {
  const product = await prisma.product.findFirst({
    where:{
      id: Number(req.params.productId),
    }
  });
  res.send(product);
})

app.post("/sign-up", async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: {
        email: req.body.email,
        lastName: req.body.lastName,
        name: req.body.name,
        password: req.body.password,
      },
      include: {
        userCart: true,
        viewedProducts: true,
      }
    });

    const cart = await prisma.userCart.create({
      data: {
        userId: user.id,
      },
      include: {
        items: true,
      },
    });

    user.userCart = cart;

    // const updatedUser = await prisma.user.findFirst({
    //   where: { id: user.id },
    //   include: {
    //     userCart: {
    //       include: {
    //         items: true,
    //       },
    //     },
    //   },
    // });

    // updatedUser?.userCart?.items

    res.send(user);
  } catch {
    res.status(500).send({ error: true });
  }
})

//crud patch

app.post("/login", async (req, res) => {
  try{
    const user = await prisma.user.findFirst({
      where: {
        email: req.body.email,
        password: req.body.password,
      },
      include: {
        userCart: {
          include: {
            items: true,
          },
        },
      },
    });
    console.log(user);
    res.send(user);
  }catch{
    res.status(500).send({ error: true });
  }
})

app.post("/product-view", async (req, res) => {
  try {
    await prisma.product.update({
      where:{
        id: Number(req.body.productId),
      },
      data: {
        views: {increment: 1}
      }
    });
  
    res.send({ ok: true });
  } catch {
    res.status(500).send({ error: true });
  }
})

app.post("/product-last-viewed", async (req, res) => {
  try {
    // await prisma.user.update({
    //   where:{
    //     id: Number(req.body.userId),
    //   },
    //   data: {
    //     productId: Number(req.body.productId),
    //   }
    // });
    
    await prisma.viewedProducts.create({
      data:{
        productId: Number(req.body.productId),
        userId: Number(req.body.userId),
      },
      include: {
        product: true,
        user: true,
      }
    });
  
    res.send({ ok: true });
  } catch {
    res.status(500).send({ error: true });
  }
})


// esto es un endpoint
app.post("/cart/:cartId/items", async (req, res) => {
  try{
    await prisma.userCartItem.create({
      data:{
        quantity: Number(req.body.quantity),
        productId: Number(req.body.productId),
        userCartId: Number(req.params.cartId),
      }
    });

    const cart = await prisma.userCart.findFirst({
      where: {
        id: Number(req.params.cartId),
      },
    });

    const updatedUser = await prisma.user.findFirst({
      where: {
        id: cart?.userId,
      },
      include: {
        userCart: {
          include: {
            items: true,
          },
        },
      },
    });

    res.send(updatedUser);
  } catch{
    res.status(500).send({ error: true });
  }
})


app.listen(3000, () => {
  console.log("si");
});
