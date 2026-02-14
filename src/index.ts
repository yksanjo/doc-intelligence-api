/**
 * Document Intelligence API
 * REST API for document processing and intelligence
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(express.json());

// Types
interface Document {
  id: string;
  fileName: string;
  filePath: string;
  uploadedAt: Date;
  metadata: Record<string, unknown>;
  status: 'uploaded' | 'processed' | 'error';
}

interface ProcessedDocument extends Document {
  extractedText?: string;
  summary?: string;
  entities?: Entity[];
}

interface Entity {
  type: string;
  value: string;
  confidence: number;
}

interface QueryRequest {
  documentId?: string;
  query: string;
  topK?: number;
}

// In-memory storage (would use database in production)
const documents: Map<string, Document> = new Map();
const processedDocs: Map<string, ProcessedDocument> = new Map();

// API Routes

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Upload document
app.post('/api/documents/upload', upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const document: Document = {
      id: uuidv4(),
      fileName: req.file.originalname,
      filePath: req.file.path,
      uploadedAt: new Date(),
      metadata: {
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
      status: 'uploaded',
    };

    documents.set(document.id, document);

    res.status(201).json({
      id: document.id,
      fileName: document.fileName,
      uploadedAt: document.uploadedAt,
      status: document.status,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// List documents
app.get('/api/documents', (req: Request, res: Response) => {
  const docs = Array.from(documents.values()).map(d => ({
    id: d.id,
    fileName: d.fileName,
    uploadedAt: d.uploadedAt,
    status: d.status,
  }));
  res.json(docs);
});

// Get document
app.get('/api/documents/:id', (req: Request, res: Response) => {
  const doc = documents.get(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.json(doc);
});

// Process document (simulated)
app.post('/api/documents/:id/process', (req: Request, res: Response) => {
  const doc = documents.get(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Simulate processing
  const processed: ProcessedDocument = {
    ...doc,
    status: 'processed',
    extractedText: 'Sample extracted text from document...',
    summary: 'This is a summary of the document content.',
    entities: [
      { type: 'date', value: '2024-01-01', confidence: 0.95 },
      { type: 'organization', value: 'Acme Corp', confidence: 0.88 },
      { type: 'person', value: 'John Doe', confidence: 0.82 },
    ],
  };

  processedDocs.set(processed.id, processed);
  documents.set(processed.id, processed);

  res.json(processed);
});

// Get processed document
app.get('/api/documents/:id/processed', (req: Request, res: Response) => {
  const doc = processedDocs.get(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Processed document not found' });
  }
  res.json(doc);
});

// Query document
app.post('/api/query', (req: Request, res: Response) => {
  const { documentId, query, topK = 5 } = req.body as QueryRequest;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  // Simulate query response
  const response = {
    query,
    answers: [
      {
        text: 'Based on the document analysis, the answer is...',
        source: documentId || 'all documents',
        confidence: 0.92,
      },
    ],
    sources: [
      {
        documentId: documentId || 'doc-1',
        excerpt: 'Relevant excerpt from the document...',
        relevance: 0.95,
      },
    ],
    timestamp: new Date().toISOString(),
  };

  res.json(response);
});

// Delete document
app.delete('/api/documents/:id', (req: Request, res: Response) => {
  const doc = documents.get(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Delete file
  if (fs.existsSync(doc.filePath)) {
    fs.unlinkSync(doc.filePath);
  }

  documents.delete(req.params.id);
  processedDocs.delete(req.params.id);

  res.json({ message: 'Document deleted successfully' });
});

// Compare documents
app.post('/api/documents/compare', (req: Request, res: Response) => {
  const { documentIdA, documentIdB } = req.body;

  if (!documentIdA || !documentIdB) {
    return res.status(400).json({ error: 'Two document IDs required' });
  }

  const docA = documents.get(documentIdA);
  const docB = documents.get(documentIdB);

  if (!docA || !docB) {
    return res.status(404).json({ error: 'One or both documents not found' });
  }

  // Simulate comparison
  const comparison = {
    documentA: docA.fileName,
    documentB: docB.fileName,
    similarity: 0.75,
    differences: [
      { type: 'added', content: 'New section added in document B' },
      { type: 'removed', content: 'Section removed from document A' },
      { type: 'modified', content: 'Terms updated in clause 5' },
    ],
    timestamp: new Date().toISOString(),
  };

  res.json(comparison);
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Document Intelligence API running on port ${PORT}`);
});

export default app;
