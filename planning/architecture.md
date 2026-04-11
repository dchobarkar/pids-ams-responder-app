# Architecture

## Mobile App

- React Native (Expo)
- TypeScript

## Storage

- SQLite for GPS logs
- Queue system for syncing

## Sync Flow

GPS → Local DB → Queue → API (bulk upload)

## API Contract

POST /gps/bulk-upload
