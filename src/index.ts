import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { idText } from "typescript";
import sendWelcomeMail from './mailing/sendWelcomeMail';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const prisma = new PrismaClient({log: ['query']});

app.get("/products", async (req, res) => {
  const sortByViews = req.query.sortByViews;
  //const limit = Number(req.query.limit) || undefined;
  const limit = 3;
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
        id: 'desc' as any,
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

    const productsV = await prisma.viewedProducts.findMany({
      where: {       
        userId: Number(req.body.userId),      
      },
      orderBy: {
        id: 'desc'
      },
      take: 3,
      select: {
        product: true,
      },
    });


    res.send(productsV);
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
    const existentUser = await prisma.user.findFirst({
      where:{
        email: req.body.email,
      },
    });
    if(existentUser){
      res.send({
        error:"Email ya registrado",
      });
      return;
    }

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
    sendWelcomeMail(user);
    res.send({ user });
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
    if(!user) {
      res.send({error: "Usuario o contraseña incorrectos"})
      return;
    }
    res.send({user});
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
    
    const cart = await prisma.userCart.findFirst({
      where: {
        id: Number(req.params.cartId),
      },
      include:{
        items: true,
      },
    });
    const currentItem = cart?.items?.find((item) => item.id === req.body.productId);
    if(currentItem){
      currentItem.quantity+=req.body.quantity;
      await prisma.userCartItem.update({
        where:{
          id: currentItem.id,
        },
        data:{
          quantity: currentItem.quantity,
        },
      });
    }else{
      await prisma.userCartItem.create({
        data:{
          quantity: Number(req.body.quantity),
          productId: Number(req.body.productId),
          userCartId: Number(req.params.cartId),
        }
      });
    }


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

app.post("/users/:userId/purchases", async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where:{
        id: Number(req.params.userId),
      },
      include:{
        userCart:{
           include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      res.sendStatus(404);
      return;
    }

    if (user.userCart?.items.length === 0) {
      res.send({ error: 'No se puede realizar una compra sin productos' });
    }

    const purchase = await prisma.purchase.create({
      data:{
        userId: user.id,
        items: {
          // create: [
          //   { quantity: 1, productId: 1, price: 123 },
          //   { quantity: 1, productId: 2, price: 456 },
          //   { quantity: 1, productId: 3, price: 789 },
          // ],
          create: user.userCart?.items.map((item) => {
            return {
              quantity: item.quantity,
              productId: item.productId,      
              price: item.product.price,
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });

    res.send({ purchase });
  } catch {
    res.status(500).send({ error: true });
  }
})

app.listen(3000, () => {
  console.log("si");
});
