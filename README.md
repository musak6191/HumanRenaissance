# Human Renaissance

Human Renaissance is a marketplace-web-app for freelancers and commissioners. Its aim is to rethink communication between artists and partners and shape it new through new interaction concepts!

## Additional Info

There is another Readme called README_AI.md. It´s for the distinction between my ReadMe entries and the ones of the Agent. If something here is written by an agent (which will be very little), it is because it says a very similiar thing I want to say.

## Tech Stack

Frontend: Next.js with App Router (Port 5173), React Server Components and Tailwind CSS
Backend: Express (Port 3000)

Security: bcrypt for password hash, Session-JWT with HttpOnly cookies. Resource queries are scoped to the authenticated `req.user.userId`, and the frontend uses `authFetch` for credentialed requests.

Database: SQLite via Prisma ORM

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
- Commissions
- Chat

Data persistancy is now secured with SQLite and Prisma ORM. This is of course not the final solution. For the deployment I will probably migrate PostGreSQL and need a secondary data bank for the Portfolio Pictures, for that I will use a S3 - data bank. Next up is authentification :thumpsup:

## Working on AuthN & AuthZ 07_11_2026

Added Post Handlers for /auth/register & /login, password hashes (bcrypt), JWT payloads for authZ and the agent implemented cors for this. I expect a few bugs.

First worked on an DIY implementetion of authN & authZ but for exploring purposes I switched up to Clerk authentification. If there is time, I will maybe switch back to a DIY solution.

09_11_2026: I am reverting back to a DIY solution, because clerk made many problems and didn´t gave me the agency for the UX I am aiming for. Still good to know that there is an easy-to-implement & fast-to-market approach to auth.
Implemented a middleware and replaced fetch() with authFetch()
For security issues: Added a owner concept to art groups. Fixed chat reassignment vulnerability. Implemented a centralized JWT config with stronger rules to it and it now checks JWT at server startup too.

## Further API Work 10_11_2026

I linked the login and registration now to artist and commissioner account. So when registering now you choose if you are an artist or a commissioner. Before you were always a commissioner.

## Further Work on implementation of more screens and overhaul of old ones 10_11_2026

So I got my designs in Figma ready to be implemented and here is the list of screens that are implemented:
    - Login screen overhauled
    - Register screen no.
        - 1
        - 2