import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";
import { closeInMongodConnection } from "./test-db";

describe("AuthController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await app.close();
  });

  describe("/api/auth/register (POST)", () => {
    it("should register a new user", () => {
      return request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          password: "Test123!@#",
          name: "Test User",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
          expect(res.body).toHaveProperty("user");
          expect(res.body.user.email).toBe("test@example.com");
        });
    });

    it("should reject duplicate email", async () => {
      // First registration
      await request(app.getHttpServer()).post("/api/auth/register").send({
        email: "duplicate@example.com",
        password: "Test123!@#",
        name: "Test User",
      });

      // Second registration with same email
      return request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: "duplicate@example.com",
          password: "Test123!@#",
          name: "Another User",
        })
        .expect(400);
    });

    it("should reject invalid email", () => {
      return request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: "invalid-email",
          password: "Test123!@#",
          name: "Test User",
        })
        .expect(400);
    });

    it("should reject weak password", () => {
      return request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: "test2@example.com",
          password: "123",
          name: "Test User",
        })
        .expect(400);
    });
  });

  describe("/api/auth/login (POST)", () => {
    beforeAll(async () => {
      // Create a test user
      await request(app.getHttpServer()).post("/api/auth/register").send({
        email: "login@example.com",
        password: "Test123!@#",
        name: "Login User",
      });
    });

    it("should login with valid credentials", () => {
      return request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          email: "login@example.com",
          password: "Test123!@#",
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
          expect(res.body).toHaveProperty("user");
        });
    });

    it("should reject invalid email", () => {
      return request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "Test123!@#",
        })
        .expect(401);
    });

    it("should reject invalid password", () => {
      return request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          email: "login@example.com",
          password: "WrongPassword123!",
        })
        .expect(401);
    });
  });

  describe("/api/auth/profile (GET)", () => {
    let authToken: string;

    beforeAll(async () => {
      // Register and login to get token
      const response = await request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: "profile@example.com",
          password: "Test123!@#",
          name: "Profile User",
        });
      authToken = response.body.access_token;
    });

    it("should return user profile with valid token", () => {
      return request(app.getHttpServer())
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe("profile@example.com");
          expect(res.body.name).toBe("Profile User");
        });
    });

    it("should reject request without token", () => {
      return request(app.getHttpServer()).get("/api/auth/profile").expect(401);
    });

    it("should reject request with invalid token", () => {
      return request(app.getHttpServer())
        .get("/api/auth/profile")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });
  });
});
