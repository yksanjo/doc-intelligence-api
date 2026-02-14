# Document Intelligence API

REST API for document processing and intelligence.

## Features

- Document upload and management
- Document processing and extraction
- Natural language querying
- Document comparison
- Entity extraction

## Installation

```bash
npm install
npm run build
```

## Usage

```bash
# Start the server
npm start

# The API will be available at http://localhost:3000
```

## API Endpoints

### Health Check
```
GET /health
```

### Upload Document
```
POST /api/documents/upload
Content-Type: multipart/form-data
```

### List Documents
```
GET /api/documents
```

### Get Document
```
GET /api/documents/:id
```

### Process Document
```
POST /api/documents/:id/process
```

### Query
```
POST /api/query
{
  "query": "What is the main topic?",
  "documentId": "optional-document-id"
}
```

### Compare Documents
```
POST /api/documents/compare
{
  "documentIdA": "doc-1",
  "documentIdB": "doc-2"
}
```

### Delete Document
```
DELETE /api/documents/:id
```

## License

MIT
