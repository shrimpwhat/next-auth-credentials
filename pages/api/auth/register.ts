import { NextApiRequest, NextApiResponse } from "next";
import { createHash } from "crypto";
import { getToken } from "next-auth/jwt";
import argon2 from "argon2";
import prisma from "../../../prisma";

const secret = process.env.NEXTAUTH_SECRET;

const verifyCsrfToken = (req: NextApiRequest) => {
  const { csrfToken } = req.body;
  const [csrfTokenValue, csrfTokenHash] = (
    req.cookies["next-auth.csrf-token"] ?? ""
  ).split("|");
  const newHash = createHash("sha256")
    .update(`${csrfToken}${secret}`)
    .digest("hex");
  return csrfToken === csrfTokenValue && newHash === csrfTokenHash;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).send("Only POST method allowed");
    return;
  }
  const session = await getToken({ req });
  if (session) {
    res.status(403).send("You are already authenticated");
    return;
  }
  if (!verifyCsrfToken(req)) {
    res.status(401).send("Bad CSRF token");
    return;
  }
  const { email, password } = req.body;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) res.json({ success: false, message: "User already exists" });
  else if (!email || !email.includes("@") || !password)
    res.json({ success: false, message: "Invalid data" });
  else {
    await prisma.user.create({
      data: { email, password: await argon2.hash(password) },
    });
    res.json({ success: true });
  }
};
export default handler;
