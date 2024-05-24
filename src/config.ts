import dotenv from "dotenv";
import bunyan from "bunyan";
import cloudinary from "cloudinary";
dotenv.config({});
class Config {
  public DATABASE_URL: string | undefined;
  public JWT_TOKEN_SECRET: string | undefined;
  public NODE_ENV: string | undefined;
  public SECRETE_KEY_1: string | undefined;
  public SECRETE_KEY_2: string | undefined;
  public REDIS_URL: string | undefined;
  public CLOUD_NAME: string | undefined;
  public CLOUD_API_KEY: string | undefined;
  public CLOUD_API_SECRET: string | undefined;
  private readonly defaultDATABASE_URL = "mongodb://localhost:27017/chewata";
  constructor() {
    this.DATABASE_URL = process.env.DATABASE_URL || this.defaultDATABASE_URL;
    this.JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET || '';
    this.NODE_ENV = process.env.NODE_ENV ;
    this.SECRETE_KEY_1 = process.env.SECRETE_KEY_1 ;
    this.SECRETE_KEY_2 = process.env.SECRETE_KEY_2;
    this.REDIS_URL = process.env.REDIS_URL;
    this.CLOUD_NAME = process.env.CLOUD_NAME;
    this.CLOUD_API_KEY = process.env.CLOUD_API_KEY;
    this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET;

  }
  public createLogger(name :string): bunyan {
    return bunyan.createLogger({ name,level: 'debug'});
  }
  public validateConfig(): void {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) {
        throw new Error(`Missing environment variable ${key}`);
      }
    }
  }
  public cloudinaryConfig(): void {
    cloudinary.v2.config({
      cloud_name: this.CLOUD_NAME,
      api_key: this.CLOUD_API_KEY,
      api_secret: this.CLOUD_API_SECRET
    })
  }
}

export const config: Config = new Config();
