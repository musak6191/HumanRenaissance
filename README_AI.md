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

Each commission contains a `commissionerId`, an `artistIds` array, a `started` boolean, a `fusionCommission` boolean, an `enteredAt` timestamp, and a nullable `startedAt` timestamp. A regular commission must reference exactly one artist; a fusion commission must reference at least two artists. All referenced artists and the commissioner must exist.

Artists have the fields `surname`, `name`, `biography`, `email`, `passwordHash`, `city`, `zipCode`, `country`, and `portfolioPictures`. An artist can have at most four portfolio pictures. Artist creation and replacement return `400` for missing credentials, duplicate e-mail addresses, or more than four portfolio pictures.

Registrations are stored in memory and own the user's `email` and `password`. Use `GET`, `POST`, `PUT /api/auth/registration/:id`, and `DELETE /api/auth/registration/:id` for registration management. Artist and commissioner profiles no longer contain authentication fields.

Art groups contain one unique `artStyle`, up to three string values in `interests`, an `artistIds` array, and a `visibility` of `public`, `private`, or `invitation`. Artist IDs must reference existing artists.

Chats connect exactly one artist with one commissioner and contain text, picture, or speech-memo messages. Pictures and speech memos are currently stored as string references in RAM; binary file storage and authentication will be added later.

## Data schema

The persistent-storage schema for the current API resources is available at
[`server/schema.sql`](server/schema.sql). It is SQLite-compatible and
normalizes API arrays into join tables:

- `commission_artists` stores accepted `artistIds`.
- `commission_applicants` stores `applicantIds`.
- `art_group_artists` stores an art group's `artistIds`.
- `artist_portfolio_pictures` and `art_group_interests` preserve array order.
- `messages` stores the type-specific `content`, `picture`, or `speechMemo`
  value used by the chat endpoints.

The registration route accepts a password, but a database integration must hash
it into `registrations.password_hash` and must never persist or return the raw
password.