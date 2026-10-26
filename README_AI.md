## Commission API

The Express backend runs on port 3000 and stores commissions in memory. The available endpoints are:

- `GET /api/commission` - return all commissions
- `GET /api/commission/:id` - return one commission, or `404` when it does not exist
- `POST /api/commission` - create a commission; `title` is required and missing titles return `400`
- `PUT /api/commission/:id` - completely replace an existing commission, or return `404` when it does not exist
- `DELETE /api/commission/:id` - delete an existing commission and return `204`, or return `404` when it does not exist

The existing plural collection endpoints are retained as aliases for compatibility.
