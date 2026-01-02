# Production File Storage Guide

In a production environment, storing files in a temporary folder on the application server is rarely the best approach because:
1. **Scalability**: If you add more servers (scaling horizontally), a file saved on Server A cannot be downloaded from Server B.
2. **Persistence**: If the server restarts or crashes, local files might be lost (if in `/tmp`).
3. **Storage Limits**: Local disks have limited space and can fill up, crashing the application.

## Recommended Approach: Object Storage (AWS S3, Google Cloud Storage, Azure Blob)

The industry standard for storing generated files (like PDFs, images, invoices) is **Object Storage**.

### Why?
- **Durability**: 99.999999999% durability guarantees.
- **Scalability**: Unlimited storage space.
- **Performance**: Offloads the download traffic from your API server. The user downloads directly from the storage provider.
- **Security**: You can generate "Presigned URLs" that allow temporary access to a file (e.g., valid for only 15 minutes), keeping them private otherwise.

### The Workflow

1. **Client** requests PDF generation (`POST /pdf`).
2. **Server** generates the PDF (using Puppeteer).
3. **Server** uploads the PDF stream directly to S3 (AWS) or GCS (Google).
4. **Server** generates a **Presigned URL** (a temporary, secure link).
5. **Server** returns the URL to the client.
6. **Client** downloads the file directly from S3.

## Comparison of Approaches

| Approach | Scalability | Complexity | Cost | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **Local Disk (Current)** | Low (Server dependent) | Low | Low | Development / Small internal tools |
| **Database (BLOBs)** | Medium | Medium | High | Small files (<1MB) tightly coupled to data |
| **Object Storage (S3)** | **High** | Medium | **Low** | **Production Applications** |

## Implementation Steps (AWS S3 Example)

1. **Install SDK**: `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
2. **Configuration**: Set up AWS credentials in `.env`.
3. **Upload Code**:

```javascript
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "us-east-1" });

export async function uploadAndGetLink(pdfBuffer, filename) {
  const params = {
    Bucket: "my-invoice-bucket",
    Key: `invoices/${filename}`,
    Body: pdfBuffer,
    ContentType: "application/pdf"
  };

  // 1. Upload
  await s3.send(new PutObjectCommand(params));

  // 2. Generate Temporary Download Link (valid for 15 mins)
  const command = new GetObjectCommand({
    Bucket: params.Bucket,
    Key: params.Key
  });
  
  return await getSignedUrl(s3, command, { expiresIn: 900 });
}
```
