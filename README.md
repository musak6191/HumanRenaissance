# Human Renaissance

Human Renaissance is a marketplace-web-app for freelancers and commissioners. Its aim is to rethink communication between artists and partners and shape it new through new interaction concepts!

## Tech Stack

Frontend: Next.js with App Router (Port 5173), React Server Components and Tailwind CSS
Backend: Express (Port 3000)

Ressources: Artist, Commissioner, Commission, Artgroups, Artboard, Chats, Calls
Hierarchy: 1 Commission belongs to 1 commissioner
            n Artists apply to one commission
            n Artists can be accepted in one commission
            n Artists can be part of one artgroup
            1 Artgroup can have 1 Artboard
            n Artists can have Chats and Calls with 1 Commissioner

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