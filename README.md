# Human Renaissance

Human Renaissance is a marketplace-web-app for freelancers and commissioners. Its aim is to rethink communication between artists and partners and shape it new through new interaction concepts!

## Additional Info

There is another Readme called README_AI.md. It´s for the distinction between my ReadMe entries and the ones of the Agent.

## Tech Stack

Frontend: Next.js with App Router (Port 5173), React Server Components and Tailwind CSS
Backend: Express (Port 3000)

Database: SQLite via Prisma ORM

### Prisma setup

Copy `.env.example` to `.env`, then run:

```bash
npm install
npx prisma migrate dev
npx prisma generate
```

The SQLite database is created as `dev.db` in the project root.

Ressources: Artist, Commissioner, Commission, Artgroups, Artboard, Chats, Calls
Hierarchy: 1 Commission belongs to 1 commissioner
            n Artists apply to one commission
            n Artists can be accepted in one commission
            n Artists can be part of one artgroup
            1 Artgroup can have 1 Artboard
            n Artists can have Chats and Calls with 1 Commissioner

Data Scheme:

registrations       artists              commissioners
--------------      ----------------     ----------------
id                  id                   id
email               surname               surname
password_hash       name                  name
                    biography             biography
                    city                  city
                    zip_code              zip_code
                    country               country


commissions         art_groups            chats
----------------    ----------------      ----------------
id                  id                    id
commissionerId FK   artStyle              artistId FK
prompt              visibility            commissionerId FK
budget                                      createdAt
timeline
started
fusionCommission


commission_artists  commission_applicants art_group_artists
------------------  --------------------  ----------------
commissionId FK      commissionId FK       artGroupId FK
artistId FK          artistId FK           artistId FK UNIQUE


messages
--------
id
chatId FK
senderId
senderType
type
content / picture / speechMemo
sentAt

# Documentation

## Initial Commit 24_10_2026

initially set up the full-stack setup with vite+react and express. A nice working website came out, but there is still much work todo.

## Migrated Next.js 24_10_2026

Migrated from Vite+React to Next.js because of SEO and up-to-date Data. Either way I want to strengthen my know-how with that framework since it´s industry standard. 

## Implemented first UI changes 26_10_2026

A fully fletched out UI is about to be implemented, for now the first screen, where you make a comission via prompt, is created.

Second screen, with an overview of the commissions.

## Starting REST-API implementation 26_10_2026

Implemented an API-endpoint for commission, I tested it via the Hoppscotch Desktop App

Already implemented API Endpoints are:
    - Commissions
    - Commissioners
    - Artists
    - Registrations
    - Art groups
    - Chats

Now that the API is set, I can continue working on implementing new screens that correspond to the API Design

## Further implementation of Screens 26_10_2026

added a User Profile Screen for commissioners

## Set up a SQLite databank and installed Prisma as ORM 31_10_2026

Replaced API Handlers:
- Artgroups
- Artists
- Commissioner