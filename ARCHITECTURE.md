## Inputs

```
fb/whatsapp/ig newMessage: API Gateway -> SQS -> Lambda -> DDB
```

# Operator websocket (Client's inbox page)

```
Frontend renders: 1 new message from customerId  <- 1 operator <- 1 websocket <- 1 lambda <- DDB Stream event <- 1 lambda(write new message to db) <- 1 websocket <- 1 customer event(send message to operator)
Inverse for customer. Could be any event too: disconnect, image, create ticket, subscribe user, update users cart etc.
```

# Customer visits an organisation's website

```
DDB Stream event <- 1 lambda(create new customer/customer lookup) <- one websocket <- one customer event
DDB stream (ex. operator sent a new message) -> 1 lambda -> 1 websocket -> customer receives event(sees operators new message) -> add to frontend state
```
