# everestmart
- Api lacks uer profile return with token,
- and most searched product by customers
- my app lacks implementation to a hive datastructure for most recently searched items by user
- address api is not implemented
- a separate otp api is not defined in server

## APIs

1) http://localhost:5000/
```
- (async () => {await fetch("http://localhost:5000/").then(async (a)=>{let b = await a.text();console.log(b)});})()
-curl http://localhost:5000/
{"message":"🏔️ EverestMart API v1.0.0","status":"running","environment":"development","timestamp":"2026-01-12T04:46:12.085Z","performance":{"compression":"enabled","caching":"enabled","rateLimiting":"enabled"},"endpoints":{"health":"/api/health","auth":"/api/auth","products":"/api/products","orders":"/api/orders","admin":"/api/admin","riders":"/api/rider","payments":"/api/payments","categories":"/api/categories","orderHistory":"/api/order-history","wishlist":"/api/wishlist","addresses":"/api/addresses","reviews":"/api/reviews","cart":"/api/cart"}}
```

2) http://localhost:5000/api/products
```
- (async () => {await fetch("http://localhost:5000/api/products").then(async (a)=>{let b = await a.text();console.log(b)});})()

{"success":true,"products":[{"_id":"695bc64a1aff9993ad16491f","name":"Kana Chawal","description":"Nothing can taste better than my rice","price":1000,"category":"groceres","image":"/uploads/1767622217995-570619503.jpg","stock":199,"unit":"kg","unitQuantity":1,"createdAt":"2026-01-05T14:10:18.107Z","__v":0}],"pagination":{"total":1,"page":1,"pages":1}}
```

3) http://localhost:5000/api/products/categories/list
```
async () => {await fetch("http://localhost:5000/api/products/categories/list").then(async (a)=>{let b = await a.text();console.log(b)});})()

{"success":true,"categories":["groceres"]}

```

4) http://localhost:5000/api/products?category=groceres
```
- (async () => {
  const res = await fetch(
    "http://localhost:5000/api/products?category=groceres"
  );
  const data = await res.json();
  console.log(data);
})();
 
{
    "success": true,
    "products": [
        {
            "_id": "695bc64a1aff9993ad16491f",
            "name": "Kana Chawal",
            "description": "Nothing can taste better than my rice",
            "price": 1000,
            "category": "groceres",
            "image": "/uploads/1767622217995-570619503.jpg",
            "stock": 199,
            "unit": "kg",
            "unitQuantity": 1,
            "createdAt": "2026-01-05T14:10:18.107Z",
            "__v": 0
        }
    ],
    "pagination": {
        "total": 1,
        "page": 1,
        "pages": 1
    }
}
```

5) 
```
- (async () => {
  const res = await fetch(
    "http://localhost:5000/api/products?search=kana"
  );
  const data = await res.json();
  console.log(data);
})();

{
    "success": true,
    "products": [
        {
            "_id": "695bc64a1aff9993ad16491f",
            "name": "Kana Chawal",
            "description": "Nothing can taste better than my rice",
            "price": 1000,
            "category": "groceres",
            "image": "/uploads/1767622217995-570619503.jpg",
            "stock": 199,
            "unit": "kg",
            "unitQuantity": 1,
            "createdAt": "2026-01-05T14:10:18.107Z",
            "__v": 0
        }
    ],
    "pagination": {
        "total": 1,
        "page": 1,
        "pages": 1
    }
}
```

6) 
```
- (async () => {
  const res = await fetch(
    "http://localhost:5000/api/products?minPrice=500&maxPrice=1500"
  );
  const data = await res.json();
  console.log(data);
})();

{
    "success": true,
    "products": [
        {
            "_id": "695bc64a1aff9993ad16491f",
            "name": "Kana Chawal",
            "description": "Nothing can taste better than my rice",
            "price": 1000,
            "category": "groceres",
            "image": "/uploads/1767622217995-570619503.jpg",
            "stock": 199,
            "unit": "kg",
            "unitQuantity": 1,
            "createdAt": "2026-01-05T14:10:18.107Z",
            "__v": 0
        }
    ],
    "pagination": {
        "total": 1,
        "page": 1,
        "pages": 1
    }
}
```

7) (async () => {
  const res = await fetch(
    "http://localhost:5000/api/products?minPrice=1500"
  );
  const data = await res.json();
  console.log(data);
})();

7b) (async () => {
  const res = await fetch(
    "http://localhost:5000/api/products?inStock=true"
  );
  const data = await res.json();
  console.log(data);
})();
```
{
    "success": true,
    "products": [
        {
            "_id": "695bc64a1aff9993ad16491f",
            "name": "Kana Chawal",
            "description": "Nothing can taste better than my rice",
            "price": 1000,
            "category": "groceres",
            "image": "/uploads/1767622217995-570619503.jpg",
            "stock": 199,
            "unit": "kg",
            "unitQuantity": 1,
            "createdAt": "2026-01-05T14:10:18.107Z",
            "__v": 0
        }
    ],
    "pagination": {
        "total": 1,
        "page": 1,
        "pages": 1
    }
}
```

8) (async () => {
  const res = await fetch(
    "http://localhost:5000/api/products?inStock=true"
  );
  const data = await res.json();
  console.log(data);
})();
```
{
    "success": true,
    "products": [
        {
            "_id": "695bc64a1aff9993ad16491f",
            "name": "Kana Chawal",
            "description": "Nothing can taste better than my rice",
            "price": 1000,
            "category": "groceres",
            "image": "/uploads/1767622217995-570619503.jpg",
            "stock": 199,
            "unit": "kg",
            "unitQuantity": 1,
            "createdAt": "2026-01-05T14:10:18.107Z",
            "__v": 0
        }
    ],
    "pagination": {
        "total": 1,
        "page": 1,
        "pages": 1
    }
}
```

10) (async () => {
  const res = await fetch(
    "http://localhost:5000/api/products?sortBy=price&sortOrder=asc"
  );
  const data = await res.json();
  console.log(data);
})();
```
{
    "success": true,
    "products": [
        {
            "_id": "695bc64a1aff9993ad16491f",
            "name": "Kana Chawal",
            "description": "Nothing can taste better than my rice",
            "price": 1000,
            "category": "groceres",
            "image": "/uploads/1767622217995-570619503.jpg",
            "stock": 199,
            "unit": "kg",
            "unitQuantity": 1,
            "createdAt": "2026-01-05T14:10:18.107Z",
            "__v": 0
        }
    ],
    "pagination": {
        "total": 1,
        "page": 1,
        "pages": 1
    }
}
```

11) (async () => {
  const res = await fetch(
    "http://localhost:5000/api/products?" +
    new URLSearchParams({
      search: "kana",
      category: "groceres",
      minPrice: "500",
      maxPrice: "1500",
      inStock: "true",
      sortBy: "price",
      sortOrder: "asc"
    })
  );
  const data = await res.json();
  console.log(data);
})();

```
{
    "success": true,
    "products": [
        {
            "_id": "695bc64a1aff9993ad16491f",
            "name": "Kana Chawal",
            "description": "Nothing can taste better than my rice",
            "price": 1000,
            "category": "groceres",
            "image": "/uploads/1767622217995-570619503.jpg",
            "stock": 199,
            "unit": "kg",
            "unitQuantity": 1,
            "createdAt": "2026-01-05T14:10:18.107Z",
            "__v": 0
        }
    ],
    "pagination": {
        "total": 1,
        "page": 1,
        "pages": 1
    }
}
```

12) (async () => {
  console.log("PAGE 1");
  console.log(await (await fetch(
    "http://localhost:5000/api/products?page=1&limit=1"
  )).json());

  console.log("PAGE 2");
  console.log(await (await fetch(
    "http://localhost:5000/api/products?page=2&limit=1"
  )).json());
})();

```
{
    "success": true,
    "products": [
        {
            "_id": "695bc64a1aff9993ad16491f",
            "name": "Kana Chawal",
            "description": "Nothing can taste better than my rice",
            "price": 1000,
            "category": "groceres",
            "image": "/uploads/1767622217995-570619503.jpg",
            "stock": 199,
            "unit": "kg",
            "unitQuantity": 1,
            "createdAt": "2026-01-05T14:10:18.107Z",
            "__v": 0
        }
    ],
    "pagination": {
        "total": 1,
        "page": 1,
        "pages": 1
    }
}

{
    "success": true,
    "products": [],
    "pagination": {
        "total": 1,
        "page": 2,
        "pages": 1
    }
}
```

lib/
│
├── core/                    # App-wide utilities
│   ├── network/
│   │   ├── api_client.dart
│   │   ├── api_interceptor.dart
│   │   ├── api_exceptions.dart
│   │
│   ├── storage/
│   │   ├── hive_init.dart
│   │
│   ├── error/
│   └── constants/
│
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   │   ├── auth_firebase_ds.dart
│   │   │   │   ├── auth_remote_ds.dart
│   │   │   ├── models/
│   │   │   │   ├── user_model.dart
│   │   │   ├── repositories/
│   │   │   │   ├── auth_repository_impl.dart
│   │   │
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── user.dart
│   │   │   ├── repositories/
│   │   │   │   ├── auth_repository.dart
│   │   │
│   │   ├── bloc/
│   │   │   ├── auth_bloc.dart
│   │   │   ├── auth_event.dart
│   │   │   ├── auth_state.dart
│   │   │
│   │   └── ui/
│   │       ├── login_page.dart
│   │
│   ├── products/
│   ├── orders/
│   └── users/
│
└── main.dart
