import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { idText } from "typescript";
import sendWelcomeMail from './mailing/sendWelcomeMail';
import { debug } from "console";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const prisma = new PrismaClient({log: ['query']});

// esto es un endpoint
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
}) //crear usuario

app.post("/login", async (req, res) => {
  try{
    const user = await prisma.user.findFirst({
      where: {
        email: req.body.email,
        password: req.body.password,
      },
      include: {
        userCart:{
          include:{
            items: true,
          },
        },
        viewedProducts: {
          include: {
            product:true,
          },
        },
        purcharse: {
          include: {
            items: true,
          },
        },
      },
    });
    user?.userCart?.id
    if(!user) {
      res.send({error: "Usuario o contraseña incorrectos"})
      return;
    }
    res.send({user});
  }catch{
    res.status(500).send({ error: true });
  }
}) //login

app.post("/myProfile", async (req, res) => {
  try{
    const user = await prisma.user.update({
      where: {
        id: req.body.userId,
      },
      data: {
        name: req.body.name,
        lastName: req.body.lastName,
        password: req.body.password,
        card: req.body.card,
        address: req.body.address,
        postcode: req.body.postcode,
        city: req.body.city,
      },
      include: {
        userCart:{
          include:{
            items: true,
          },
        },
        viewedProducts: {
          include: {
            product:true,
          },
        },
        purcharse: {
          include: {
            items: true,
          },
        },
      },
    })

    res.send({user});
  }catch{
    res.send({error: "Error inesperado"})
  }
}) //editar informacion de usuario

app.get("/loggedUser/:userId", async (req, res) => {
  const userId = req.params.userId;

  const loggedUser = await prisma.user.findFirst({
    where: {
      id: Number(userId),
    },
    include: {
      userCart: {
        include: {
          items: true,
        },
      },
      purcharse: {
        include: {
          items: true,
        },
      },
    },
  });
  res.send(loggedUser);
}) //buscar usuario loggeado

app.get("/product/:productId", async (req, res) => {
  const product = await prisma.product.findFirst({
    where:{
      id: Number(req.params.productId),
    }
  });
  res.send(product);
}) //Buscar un producto

app.get("/products", async (req, res) => {
  const limit = Number(req.query.limit) || undefined;

  const conditions = [];
  const inCategory = [];
  
  if (req.query.search) {
    conditions.push({
      description: {
        contains: req.query.search as any || undefined,
      },
    });
  }
  if (req.query.search) {
    conditions.push({
      name: {
        contains: req.query.search as any || undefined,
      },
    })
  }


  
  if (req.query.categoryId) {
    inCategory.push({
      categoryId: Number(req.query.categoryId) || undefined,
    })
  }

  
  const products = await prisma.product.findMany({
    where: {
      OR: conditions.length ? conditions : undefined,
      AND: inCategory.length ? inCategory : undefined,
    },
    orderBy: {
      views: req.query.viewsSort as any || undefined,
    },
    take: limit,
  });
  res.send(products);
}) //Muestra los productos con o sin filtro

app.post("/productsViewed", async (req, res) => {
  try{
    //const limit = Number(req.query.limit) || undefined;

    const products = await prisma.product.findMany({
      orderBy: {
        id: 'desc' as any,
      },
      take: Number(req.body.limit),
      where: {
        viewedProducts: {
          some: {
            user: {
              id: Number(req.body.userId),
            },
          },
        },
      },
    });

    //const productsV = await prisma.viewedProducts.findMany({
    //  where: {       
    //    userId: Number(req.body.userId),      
    //  },
    //  orderBy: {
    //    id: 'desc'
    //  },
    //  take: 3,
    //  select: {
    //    product: true,
    //  },
    //});


    res.send(products);
  }
  catch{
    res.status(500).send({ error: true });
  }
}) //Muestra los productos vistos por el usuario

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
}) //Aumenta los views

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

app.post("/product-last-viewed", async (req, res) => {
  try {
    //await prisma.user.update({
    //  where:{
    //    id: Number(req.body.userId),
    //  },
    //  data: {
    //    productId: Number(req.body.productId),
    //  }
    //});
    
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
}) //crea un historial

//crud patch

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

    const currentItem = cart?.items?.find((item) => item.productId === Number(req.body.productId));
    
    if(currentItem){
      await prisma.userCartItem.update({
        where:{
          id: currentItem.id,
        },
        data:{
          quantity: {
            increment: Number(req.body.quantity),
          },
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
    };

   // await prisma.userCartItem.upsert({
   //   where:{
   //     id: Number(req.body.cartProductId),
   //   },
   //   update:{
   //     quantity: Number(req.body.quantity),
   //   },
   //   create:{
   //     quantity: Number(req.body.quantity),
   //     productId: Number(req.body.productId),
   //     userCartId: Number(req.params.cartId),
   //   }
   // });


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
}) //crear o aumenta un producto del carrito de compras

app.post("/cart/:cartId/update", async (req, res) => {
  try{
    
    const cart = await prisma.userCart.findFirst({
      where: {
        id: Number(req.params.cartId),
      },
      include:{
        items: true,
      },
    });

    const currentItem = cart?.items?.find((item) => item.productId === Number(req.body.productId));
    
    if(currentItem){
      await prisma.userCartItem.update({
        where:{
          id: currentItem.id,
        },
        data:{
          quantity: Number(req.body.quantity),
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
    };

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
}) //edita la cantidad de un producto del carrito de compras


app.post("/cart/:cartId/delete", async (req, res) => {
  try{
    
    const cart = await prisma.userCart.findFirst({
      where: {
        id: Number(req.params.cartId),
      },
      include:{
        items: true,
      },
    });

    const currentItem = cart?.items?.find((item) => item.productId === Number(req.body.productId));
    
    if(currentItem){
      await prisma.userCartItem.delete({
        where:{
          id: currentItem.id,
        },
      });
    };

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
}) //borra un producto del carrito de compras

app.get("/cart/:cartId", async (req, res) => {
    const products = await prisma.userCartItem.findMany({
      // select:{
      //   items:{
      //     where: {
      //       userCartId: Number(req.params.cartId),
      //     },
      //   },
      // }

      where: {
        userCartId: Number(req.params.cartId),
      },
      include: {
        product: true,
      },
      
    });

    res.send({ products });
}) //Buscar productos del carrito de compras

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
      return;
    }

    const purchase = await prisma.purchase.create({
      data:{
        userId: Number(user.id),
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

    await prisma.userCartItem.deleteMany({
      where: {
        userCartId: Number(user.userCart?.id),
      },
    })

    const updatedUser = await prisma.user.findFirst({
      where: {
        id: Number(req.params.userId),
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


  } catch(error) {
    console.error(error);
    res.status(500).send({ error: true });
  }
}) //Busca usuario incluye su carrito

app.get("/categories", async (req, res) => {
  const categories = await prisma.category.findMany();

  res.send(categories);
}) //muestra las categorias

app.get("/purchases/:userId", async (req, res) => {
  try {
    const purcharses = await prisma.purchase.findMany({
      where:{
        userId: Number(req.params.userId),
      },
      include:{
        items:{
          include:{
            product: true,  
          },
        },
      },
    });

    if (!purcharses) {
      res.sendStatus(404);
      return;
    }

    res.send(purcharses);

  } catch(error) {
    console.error(error);
    res.status(500).send({ error: true });
  }
}) //Busca usuario incluye su historial de compras



app.listen(3000, () => {
  console.log("si");
});
