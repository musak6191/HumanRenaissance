## Commission API

The Express backend runs on port 3000 and stores commissions in memory. The available endpoints are:

- `GET /api/commission` - return all commissions
- `GET /api/commission/:id` - return one commission, or `404` when it does not exist
- `POST /api/commission` - create a commission; `title` is required and missing titles return `400`
- `PUT /api/commission/:id` - completely replace an existing commission, or return `404` when it does not exist
- `DELETE /api/commission/:id` - delete an existing commission and return `204`, or return `404` when it does not exist

The existing plural collection endpoints are retained as aliases for compatibility.

## Commissioner API

Commissioners are stored in memory and have the fields `surname`, `name`, `biography`, `email`, `passwordHash`, `city`, `zipCode`, and `country`.

- `GET /api/commissioner` - return all commissioners
- `GET /api/commissioner/:id` - return one commissioner, or `404` when it does not exist
- `POST /api/commissioner` - create a commissioner with `201`; `email` and `passwordHash` are required and the e-mail must be unique, otherwise `400`
- `PUT /api/commissioner/:id` - completely replace an existing commissioner with `200`; invalid credentials or a duplicate e-mail return `400`
- `DELETE /api/commissioner/:id` - delete an existing commissioner and return `204`, or return `404` when it does not exist

