import dotenv from 'dotenv'
import { env } from 'process';

dotenv.config({quiet: true})
const config ={
    port: env.PORT,
    db_url: env.DATABASE_URL,
    JWT_SECRET: env.JWT_SECRET
}
export default config