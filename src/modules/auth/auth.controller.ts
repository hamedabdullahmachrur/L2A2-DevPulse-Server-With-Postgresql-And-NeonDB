import type { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utils/responseHelper";
import { StatusCodes } from "http-status-codes";
import type { SafeUser, SignupBody } from "../../types";
import { queryOne } from "../../utils/dbQuery";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from "../../config";


export const signup = async (req: Request, res: Response) => {
  const { name, email, password, role = 'contributor' }: SignupBody = req.body;

  if (!name || !email || !password) {
    sendError(res, 'Name, email, and password are required.', StatusCodes.BAD_REQUEST);
    return;
  }

  if (!['contributor', 'maintainer'].includes(role)) {
    sendError(res, 'Role must be contributor or maintainer.', StatusCodes.BAD_REQUEST);
    return;
  }

  const existing = await queryOne<SafeUser>(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existing) {
    sendError(res, 'An account with this email already exists.', StatusCodes.BAD_REQUEST);
    return;
  }

  const hashPassword = await bcrypt.hash(password, 10)
  const newUser = await queryOne<SafeUser>(`
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at
    `, [name, email, hashPassword, role])
  sendSuccess(res, newUser, "User created successfully", StatusCodes.CREATED)
}

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    sendError(res, "Email and password are required.", StatusCodes.BAD_REQUEST)
  }

  const user = await queryOne<SafeUser & { password: string }>(
    `SELECT * FROM users WHERE email=$1`,
    [email]
  )

  if (!user) {
    sendError(res, "Invalid email or password.", StatusCodes.UNAUTHORIZED)
  }

  const isMatch = await bcrypt.compare(password, user?.password as string)

  if (!isMatch) {
    sendError(res, "Invalid password.", StatusCodes.UNAUTHORIZED)
  }

  const userInfo = {
    id: user?.id, 
    name: user?.name, 
    email: user?.email,
    role: user?.role ,
    created_at:user?.created_at,
    updated_at:user?.updated_at
  }

  const token = jwt.sign(
    userInfo,
    config.JWT_SECRET as string,
    { expiresIn: '7d' }
  );

  sendSuccess(res, { token, user :userInfo }, 'Login successful');

}
export const authController = {
  signup,
  login
}