import { createClient } from "@libsql/client/web";
import { connect } from "@tursodatabase/serverless";

export const db = await connect({
    url: "libsql://meowzeum-data-wati.aws-eu-central-1.turso.io",
    authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTUwMTkyODksImlkIjoiMDFhMWVmN2ItZDQwMS03NmM1LWJlMDgtMjVkNTBkOTBiMzg4Iiwia2lkIjoieVFhVG5YbmFmaGZGM2NPZ0xZQzdxdFpDTjdRLVplbFR1dGVQakpHRllLdyIsInJpZCI6ImU3MmM5ZmFiLWNjNDQtNDZlNC05MzM4LWU2YWQzOTg5NmQ3MCJ9.7EzRY_0encQ_cuyZ6f3yowRL9LyOaff11AItRGNWEOmERudos82CSNAz2dKTkiWxGkxHY8fR1nJOBStT6aYiAw",
});

export const turso = createClient({
    url: "libsql://meowzeum-data-wati.aws-eu-central-1.turso.io",
    authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTUwMTkyODksImlkIjoiMDFhMWVmN2ItZDQwMS03NmM1LWJlMDgtMjVkNTBkOTBiMzg4Iiwia2lkIjoieVFhVG5YbmFmaGZGM2NPZ0xZQzdxdFpDTjdRLVplbFR1dGVQakpHRllLdyIsInJpZCI6ImU3MmM5ZmFiLWNjNDQtNDZlNC05MzM4LWU2YWQzOTg5NmQ3MCJ9.7EzRY_0encQ_cuyZ6f3yowRL9LyOaff11AItRGNWEOmERudos82CSNAz2dKTkiWxGkxHY8fR1nJOBStT6aYiAw",
});