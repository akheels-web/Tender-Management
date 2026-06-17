import { Hono } from "hono";
import * as fs from "fs/promises";
import * as path from "path";
import { authenticateRequest } from "./lib/auth";
import { Errors } from "@contracts/errors";
import { nanoid } from "nanoid";
import { db } from "@db/index";
import { tenders, bids, users, agentDownloads } from "@db/schema";
import { eq } from "drizzle-orm";

const uploadRouter = new Hono();

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

// Ensure the uploads directory exists
async function ensureUploadsDir() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

uploadRouter.post("/", async (c) => {
  const user = await authenticateRequest(c.req.raw.headers);
  if (!user || (user.role !== "admin" && user.role !== "vendor")) {
    throw Errors.forbidden("Only admins and vendors can upload files.");
  }

  await ensureUploadsDir();

  const body = await c.req.parseBody();
  const file = body["file"] as File;

  if (!file) {
    throw Errors.badRequest("No file uploaded.");
  }
  
  if (file.type !== "application/pdf") {
    throw Errors.badRequest("Only PDF files are allowed.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw Errors.badRequest("File exceeds 10 MB limit.");
  }

  const fileExt = path.extname(file.name) || ".pdf";
  const fileName = `${nanoid()}${fileExt}`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  await fs.writeFile(filePath, buffer);

  return c.json({ 
    success: true, 
    url: `/api/files/${fileName}`, 
    fileName: file.name 
  });
});

uploadRouter.get("/:fileName", async (c) => {
  const user = await authenticateRequest(c.req.raw.headers);
  if (!user) {
    throw Errors.unauthorized("Authentication required.");
  }

  const fileName = c.req.param("fileName");
  // Simple path traversal check
  if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
    throw Errors.badRequest("Invalid file name.");
  }

  const filePath = path.join(UPLOADS_DIR, fileName);
  const fileUrl = `/api/files/${fileName}`;

  try {
    await fs.access(filePath);
  } catch {
    throw Errors.notFound("File not found.");
  }

  // Check authorization to view file
  // Admin can view anything
  if (user.role !== "admin") {
    // Is it a tender file?
    const tenderList = await db.select().from(tenders).where(eq(tenders.documentUrl, fileUrl)).limit(1);
    const tender = tenderList[0];
    
    // Is it a bid file?
    const bidList = await db.select().from(bids).where(eq(bids.documentUrl, fileUrl)).limit(1);
    const bid = bidList[0];

    if (tender) {
      if (tender.isLocked && user.role === "agent") {
         throw Errors.forbidden("Tender is locked.");
      }
      if (user.role === "agent") {
        await db.insert(agentDownloads).values({
          agentId: user.id,
          tenderId: tender.id,
        });
      }
    } else if (bid) {
      if (user.role === "vendor") {
        if (bid.vendorId !== user.id) {
          throw Errors.forbidden("You can only view your own bids.");
        }
      } else if (user.role === "agent") {
        if (bid.status !== "accepted") {
          throw Errors.forbidden("Agents can only view unlocked/accepted bids.");
        }
        // Log agent download
        await db.insert(agentDownloads).values({
          agentId: user.id,
          tenderId: bid.tenderId,
          bidId: bid.id,
        });
      }
    } else {
      // Unassociated file, reject for safety
      throw Errors.forbidden("Access denied to unassociated file.");
    }
  }

  const fileData = await fs.readFile(filePath);
  return new Response(fileData, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
    },
  });
});

export { uploadRouter };
