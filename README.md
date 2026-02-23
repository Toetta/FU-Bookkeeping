# FU-BookKeeping

> A browser-native, privacy-first bookkeeping system built with pure HTML, CSS and JavaScript.  
> Designed for multi-company usage, bank imports, multi-currency handling and secure local data management — without backend dependencies.

---

## Overview

FU-BookKeeping is a fully client-side bookkeeping system designed to:

- Run entirely in the browser
- Store data locally in JSON files
- Support multiple companies in one instance
- Import bank and tax account transactions safely
- Handle multiple currencies with exchange rates
- Provide staging workflows before posting to the ledger
- Maintain reversibility and audit safety

The system is intentionally built without backend infrastructure to demonstrate architecture, state management and safe financial workflows in a constrained environment.

---

## Why This Project Exists

Most small businesses:

- Export bank transactions manually
- Use spreadsheets
- Or rely on heavy SaaS tools

FU-BookKeeping explores:

- Can we build a serious bookkeeping system fully client-side?
- Can financial workflows be made reversible and safe in a static environment?
- Can multi-company and multi-currency be handled without backend complexity?

This project is both a practical tool and a technical exploration of financial software design in the browser.

---

## Core Features

### 1. Bank & Tax Account Import (CSV + Excel)

- Supports CSV and XLS/XLSX
- Intelligent column mapping
- Preview before import
- Validation layer
- Staging inbox (no automatic posting)
- Batch-based rollback

**Design principle:** Import must never directly affect the ledger.

---

### 2. Staging Workflow (Financial Safety Model)

All imported transactions enter an **Inbox**:

- No ledger impact
- Manual or bulk posting
- Account assignment required
- Confirmation before posting
- Full batch deletion possible
- Reversal via contra-verifications

This prevents irreversible accounting mistakes.

---

### 3. Multi-Currency Support

Supports:

- Base currency (system currency)
- Transaction currency per row
- Exchange rate handling
- Automatic FX gain/loss calculation
- Posting of FX differences to configurable accounts (3960/7960 default)

All reporting remains in base currency.

---

### 4. Multi-Company Support

- Multiple businesses within one app instance
- Separate JSON data files per company
- Separate backup directories
- Company registry with IndexedDB handle storage
- Active company switching
- Automatic migration from single-company mode

Prevents data mixing between businesses.

---

### 5. Local-First Architecture

- No backend
- No cloud database
- No server dependency
- File System Access API for persistent file handles
- IndexedDB for secure handle storage
- Daily automatic backups (per company)

Ensures full data ownership, offline capability and privacy by design.

---

## Architecture

### Tech Stack

- Vanilla HTML
- Vanilla JavaScript (no frameworks)
- CSS (custom dark UI)
- File System Access API
- IndexedDB
- PapaParse (CSV parsing)
- SheetJS (Excel parsing)

---

### Data Model

Each company has:

- Separate JSON data file
- Separate backup directory
- Local registry entry

Core state structure:

state = {
  settings,
  accounts,
  vouchers,
  bankImport: {
    batches,
    items,
    rules
  }
}

---

### Import Architecture

File → Parse → Detect Columns → Normalize → Validate → Preview → Staging Inbox

Only after manual confirmation:

Inbox → Assign Account → Create Voucher → Ledger

---

### Financial Safety Design

- No auto-posting
- Batch identifiers
- Duplicate fingerprinting
- Reversible posting (contra-verification)
- Confirmation modals for bulk actions
- Clear UI indicators for active company

---

## Migration Strategy

The system includes automatic migration:

- Detects legacy single-company setup
- Creates company registry
- Migrates file handles
- Preserves existing data
- Non-destructive fallback

---

## What This Project Demonstrates

- Financial domain modeling
- Safe workflow design
- State architecture without frameworks
- File System API usage
- IndexedDB integration
- Data migration strategy
- Reversibility in financial systems
- Multi-tenant separation in a static application

---

## Future Improvements

- Automated exchange rate API integration
- Audit log timeline view
- Role-based access control
- Encryption layer for JSON data
- Digital signing of exports
- Advanced VAT rule engine

---

## Disclaimer

FU-BookKeeping is a technical exploration and reference implementation.  
It is not certified accounting software.

---

## Author

Malkus Arlemark  
System design & implementation
