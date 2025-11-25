import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

describe('UsersService', () => {
  let service: UsersService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockUserModel: any;

  const mockUser = {
    _id: 'user-id-123',
    email: 'test@example.com',
    name: 'Test User',
    phone: '+1234567890',
    profileImage: '/uploads/profile-images/profile-123.jpg',
    password: 'hashed-password',
    dailyQuota: 100,
    usedQuotaToday: 10,
    quotaResetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    isActive: true,
    role: 'user',
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const execMock = jest.fn().mockResolvedValue(mockUser);
      mockUserModel.findOne.mockReturnValue({ exec: execMock });

      const result = await service.findByEmail('test@example.com');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const execMock = jest.fn().mockResolvedValue(null);
      mockUserModel.findOne.mockReturnValue({ exec: execMock });

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find a user by ID', async () => {
      const execMock = jest.fn().mockResolvedValue(mockUser);
      mockUserModel.findById.mockReturnValue({ exec: execMock });

      const result = await service.findById('user-id-123');

      expect(mockUserModel.findById).toHaveBeenCalledWith('user-id-123');
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const execMock = jest.fn().mockResolvedValue(null);
      mockUserModel.findById.mockReturnValue({ exec: execMock });

      const result = await service.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('hasQuotaRemaining', () => {
    it('should return true when user has quota remaining', async () => {
      const user = {
        ...mockUser,
        usedQuotaToday: 50,
        dailyQuota: 100,
        quotaResetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        save: jest.fn().mockResolvedValue(this),
      };
      mockUserModel.findById.mockResolvedValue(user);

      const result = await service.hasQuotaRemaining('user-id-123');

      expect(result).toBe(true);
    });

    it('should return false when user has no quota remaining', async () => {
      const user = {
        ...mockUser,
        usedQuotaToday: 100,
        dailyQuota: 100,
        quotaResetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        save: jest.fn().mockResolvedValue(this),
      };
      mockUserModel.findById.mockResolvedValue(user);

      const result = await service.hasQuotaRemaining('user-id-123');

      expect(result).toBe(false);
    });

    it('should reset quota if reset date has passed', async () => {
      const saveSpy = jest.fn().mockResolvedValue(this);
      const user = {
        ...mockUser,
        usedQuotaToday: 100,
        dailyQuota: 100,
        quotaResetDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        save: saveSpy,
      };
      mockUserModel.findById.mockResolvedValue(user);

      const result = await service.hasQuotaRemaining('user-id-123');

      expect(saveSpy).toHaveBeenCalled();
      expect(user.usedQuotaToday).toBe(0);
      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const result = await service.hasQuotaRemaining('nonexistent-id');

      expect(result).toBe(false);
    });
  });

  describe('updateQuota', () => {
    it('should increment used quota', async () => {
      const saveSpy = jest.fn().mockResolvedValue(mockUser);
      const user = {
        ...mockUser,
        usedQuotaToday: 10,
        quotaResetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        save: saveSpy,
      };
      mockUserModel.findById.mockResolvedValue(user);

      await service.updateQuota('user-id-123');

      expect(user.usedQuotaToday).toBe(11);
      expect(saveSpy).toHaveBeenCalled();
    });

    it('should reset quota if reset date has passed', async () => {
      const saveSpy = jest.fn().mockResolvedValue(mockUser);
      const user = {
        ...mockUser,
        usedQuotaToday: 100,
        quotaResetDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        save: saveSpy,
      };
      mockUserModel.findById.mockResolvedValue(user);

      await service.updateQuota('user-id-123');

      expect(user.usedQuotaToday).toBe(1); // Reset to 0, then incremented
      expect(saveSpy).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.updateQuota('nonexistent-id')).rejects.toThrow('User not found');
    });
  });

  describe('getRemainingQuota', () => {
    it('should return remaining quota', async () => {
      const user = {
        ...mockUser,
        usedQuotaToday: 30,
        dailyQuota: 100,
        quotaResetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
      mockUserModel.findById.mockResolvedValue(user);

      const result = await service.getRemainingQuota('user-id-123');

      expect(result).toBe(70);
    });

    it('should return full quota if reset date has passed', async () => {
      const user = {
        ...mockUser,
        usedQuotaToday: 100,
        dailyQuota: 100,
        quotaResetDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      };
      mockUserModel.findById.mockResolvedValue(user);

      const result = await service.getRemainingQuota('user-id-123');

      expect(result).toBe(100);
    });

    it('should return 0 if user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const result = await service.getRemainingQuota('nonexistent-id');

      expect(result).toBe(0);
    });

    it('should not return negative quota', async () => {
      const user = {
        ...mockUser,
        usedQuotaToday: 150,
        dailyQuota: 100,
        quotaResetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
      mockUserModel.findById.mockResolvedValue(user);

      const result = await service.getRemainingQuota('user-id-123');

      expect(result).toBe(0);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully with all fields', async () => {
      const updateDto: UpdateProfileDto = {
        name: 'Updated Name',
        phone: '+9876543210',
        profileImage: '/uploads/profile-images/profile-456.jpg',
      };

      const saveSpy = jest.fn().mockResolvedValue({
        ...mockUser,
        ...updateDto,
      });

      const user = {
        ...mockUser,
        save: saveSpy,
      };

      mockUserModel.findById.mockResolvedValue(user);

      await service.updateProfile('user-id-123', updateDto);

      expect(user.name).toBe(updateDto.name);
      expect(user.phone).toBe(updateDto.phone);
      expect(user.profileImage).toBe(updateDto.profileImage);
      expect(saveSpy).toHaveBeenCalled();
    });

    it('should update only name when only name is provided', async () => {
      const updateDto: UpdateProfileDto = {
        name: 'Updated Name Only',
      };

      const saveSpy = jest.fn().mockResolvedValue({
        ...mockUser,
        name: updateDto.name,
      });

      const user = {
        ...mockUser,
        save: saveSpy,
      };

      mockUserModel.findById.mockResolvedValue(user);

      await service.updateProfile('user-id-123', updateDto);

      expect(user.name).toBe(updateDto.name);
      expect(saveSpy).toHaveBeenCalled();
    });

    it('should update only phone when only phone is provided', async () => {
      const updateDto: UpdateProfileDto = {
        phone: '+9999999999',
      };

      const saveSpy = jest.fn().mockResolvedValue({
        ...mockUser,
        phone: updateDto.phone,
      });

      const user = {
        ...mockUser,
        save: saveSpy,
      };

      mockUserModel.findById.mockResolvedValue(user);

      await service.updateProfile('user-id-123', updateDto);

      expect(user.phone).toBe(updateDto.phone);
      expect(saveSpy).toHaveBeenCalled();
    });

    it('should update only profileImage when only profileImage is provided', async () => {
      const updateDto: UpdateProfileDto = {
        profileImage: '/uploads/profile-images/new-profile.jpg',
      };

      const saveSpy = jest.fn().mockResolvedValue({
        ...mockUser,
        profileImage: updateDto.profileImage,
      });

      const user = {
        ...mockUser,
        save: saveSpy,
      };

      mockUserModel.findById.mockResolvedValue(user);

      await service.updateProfile('user-id-123', updateDto);

      expect(user.profileImage).toBe(updateDto.profileImage);
      expect(saveSpy).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      const updateDto: UpdateProfileDto = {
        name: 'Updated Name',
      };

      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.updateProfile('nonexistent-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
