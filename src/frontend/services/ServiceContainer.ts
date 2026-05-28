import { httpAuthService } from './http/HttpAuthService';
import { httpTaskGroupService } from './http/HttpTaskGroupService';
import { USE_HTTP_SERVICES } from './http/config';
import { mockAuthService } from './mock/MockAuthService';
import { mockNotificationService } from './mock/MockNotificationService';
import { mockProfileService } from './mock/MockProfileService';
import { mockSocialService } from './mock/MockSocialService';
import { mockTaskGroupService } from './mock/MockTaskGroupService';
import { mockTaskService } from './mock/MockTaskService';
import { httpTaskService } from './http/HttpTaskService';
import type {
  IAuthService,
  INotificationService,
  IProfileService,
  ISocialService,
  ITaskGroupService,
  ITaskService,
} from './types/index';

interface ServiceContainer {
  authService: IAuthService;
  profileService: IProfileService;
  socialService: ISocialService;
  taskGroupService: ITaskGroupService;
  taskService: ITaskService;
  notificationService: INotificationService;
}

export const services: ServiceContainer = {
  authService: USE_HTTP_SERVICES ? httpAuthService : mockAuthService,
  profileService: mockProfileService,
  socialService: mockSocialService,
  taskGroupService: USE_HTTP_SERVICES ? httpTaskGroupService : mockTaskGroupService,
  taskService: USE_HTTP_SERVICES ? httpTaskService : mockTaskService,
  notificationService: mockNotificationService,
};
