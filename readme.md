# Musket API

# API

### GET: /quota/:id

Example:
```
POST: /transactions/S0000001I

body: {
  "quantity": 5
}
```

Returns:
```
[
    {
        "quantity": 5,
        "transactionTime": 1580330642589
    }
]
```


### POST: /transactions/:id

Example:
```
GET: /transactions/S0000001I
```

Returns:
```
{
    "remainingQuota": 0,
    "history": [
        {
            "quantity": 5,
            "transactionTime": 1580330434981
        }
    ]
}
```
# Development

Copy `.env` from a co-worker or insert own credentials to get started. A copy of the .env file is available at `.env.example`

```
npm run dev
```

To run local tests against dynamodb-local, run commands

 `npm run dev` to start the local database

 `npm run integration:local` to run the tests

## Dynamodb 

The development environment uses [serverless-dynamodb-local](https://www.npmjs.com/package/serverless-dynamodb-local) to emulate the dynamodb in AWS.

Install dynamodb locally

```
sls dynamodb install
```

Start dynamodb

```
sls dynamodb start
```
