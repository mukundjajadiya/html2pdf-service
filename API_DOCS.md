# PDF Service API Documentation

## 📡 API Endpoints

### 1. Health Check
```bash
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-02T09:13:40.228Z"
}
```

---

### 2. Generate PDF

**Endpoint:** `POST /api/v1/pdf`

The service supports **three methods** for PDF generation:

#### Method 1: Generate from URL

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/pdf \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Body:**
```json
{
  "url": "https://example.com"
}
```

---

#### Method 2: Generate from Raw HTML Content

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/pdf \
  -H "Content-Type: application/json" \
  -d '{"html": "<html><body><h1>Hello World</h1></body></html>"}'
```

**Body:**
```json
{
  "html": "<html><body><h1>Hello World</h1></body></html>"
}
```

---

#### Method 3: Generate from HTML File Upload

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/pdf \
  -F "htmlFile=@/path/to/your/file.html"
```

**Form Data:**
- Field name: `htmlFile`
- File type: `.html` or `.htm`
- Max size: 10MB

---

### Response (All Methods)

**Success (201):**
```json
{
  "status": "success",
  "data": {
    "url": "http://localhost:3000/api/v1/pdf/download/f741ddf5-4bdb-4a52-ae02-2b1feb26f1a1.pdf"
  }
}
```

**Error (400):**
```json
{
  "status": "fail",
  "message": "Please provide one of the following: url, html (raw content), or upload an HTML file"
}
```

---

### 3. Download PDF

**Endpoint:** `GET /api/v1/pdf/download/:filename`

**Request:**
```bash
curl http://localhost:3000/api/v1/pdf/download/{filename}.pdf -o output.pdf
```

**Note:** Files are automatically deleted after download.

---

## 🧪 Testing Examples

### Test 1: URL to PDF
```bash
curl -X POST http://localhost:3000/api/v1/pdf \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com"}'
```

### Test 2: Raw HTML to PDF
```bash
curl -X POST http://localhost:3000/api/v1/pdf \
  -H "Content-Type: application/json" \
  -d '{"html":"<html><head><style>body{font-family:Arial;padding:50px;}</style></head><body><h1>Invoice</h1><p>Amount: $100</p></body></html>"}'
```

### Test 3: HTML File Upload to PDF
```bash
# Create a test HTML file
echo '<html><body><h1>Test</h1></body></html>' > test.html

# Upload it
curl -X POST http://localhost:3000/api/v1/pdf \
  -F "htmlFile=@test.html"
```

---

## 📋 Input Validation

### URL Method
- Must be a valid HTTP/HTTPS URL
- Server must be able to access the URL

### HTML Content Method
- Must be valid HTML string
- Max size: 10MB (via body limit)

### File Upload Method
- File extension: `.html` or `.htm` only
- Max file size: 10MB
- Encoding: UTF-8

---

## ⚠️ Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Please provide one of the following... | No valid input method provided |
| 400 | Only HTML files are allowed | Invalid file type uploaded |
| 404 | File not found or expired | PDF file doesn't exist or already downloaded |
| 500 | PDF generation failed | Internal error during PDF creation |

---

## 🔒 Security

- File uploads are stored in memory (not on disk)
- Directory traversal protection on downloads
- File type validation for uploads
- Request size limits enforced
- Temporary files auto-deleted after download
