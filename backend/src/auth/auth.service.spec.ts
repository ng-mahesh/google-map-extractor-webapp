import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

// Mock bcrypt module
jest.mock("bcrypt");
import * as bcrypt from "bcrypt";

describe("AuthService", () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    _id: "user-id-123",
    email: "test@example.com",
    name: "Test User",
    password: "hashed-password",
    dailyQuota: 100,
    usedQuotaToday: 10,
    toObject: jest.fn().mockReturnValue({
      _id: "user-id-123",
      email: "test@example.com",
      name: "Test User",
      password: "hashed-password",
      dailyQuota: 100,
      usedQuotaToday: 10,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    const registerDto: RegisterDto = {
      email: "newuser@example.com",
      password: "Test123!@#",
      name: "New User",
    };

    it("should successfully register a new user", async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue("jwt-token");
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

      const result = await service.register(registerDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(usersService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: "hashed-password",
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser._id,
      });
      expect(result).toEqual({
        access_token: "jwt-token",
        user: {
          id: mockUser._id,
          email: mockUser.email,
          name: mockUser.name,
        },
      });
    });

    it("should throw ConflictException if email already exists", async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        "Email already exists"
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it("should hash the password before creating user", async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue("jwt-token");
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: "hashed-password",
        })
      );
    });
  });

  describe("login", () => {
    const loginDto: LoginDto = {
      email: "test@example.com",
      password: "Test123!@#",
    };

    it("should successfully login with valid credentials", async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue("jwt-token");
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser._id,
      });
      expect(result).toEqual({
        access_token: "jwt-token",
        user: {
          id: mockUser._id,
          email: mockUser.email,
          name: mockUser.name,
          dailyQuota: mockUser.dailyQuota,
          usedQuotaToday: mockUser.usedQuotaToday,
        },
      });
    });

    it("should throw UnauthorizedException if user not found", async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        "Invalid credentials"
      );
    });

    it("should throw UnauthorizedException if password is invalid", async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        "Invalid credentials"
      );
    });
  });

  describe("validateUser", () => {
    it("should return user without password if credentials are valid", async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        "test@example.com",
        "Test123!@#"
      );

      expect(usersService.findByEmail).toHaveBeenCalledWith("test@example.com");
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "Test123!@#",
        mockUser.password
      );
      expect(result).not.toHaveProperty("password");
      expect(result.email).toBe(mockUser.email);
    });

    it("should return null if user not found", async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        "nonexistent@example.com",
        "password"
      );

      expect(result).toBeNull();
    });

    it("should return null if password is invalid", async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        "test@example.com",
        "wrong-password"
      );

      expect(result).toBeNull();
    });
  });
});
