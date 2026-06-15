import { httpAuthService } from './http/HttpAuthService';
import { httpNotificationService } from './http/HttpNotificationService';
import { httpProfileService } from './http/HttpProfileService';
import { httpSocialService } from './http/HttpSocialService';
import { httpTaskGroupService } from './http/HttpTaskGroupService';
import { USE_HTTP_SERVICES } from './http/config';
import { mockAuthService } from './mock/MockAuthService';
import { mockNotificationService } from './mock/MockNotificationService';
import { mockProfileService } from './mock/MockProfileService';
import { mockSocialService } from './mock/MockSocialService';
import { mockTaskGroupService } from './mock/MockTaskGroupService';
import { mockTaskService } from './mock/MockTaskService';
import { httpTaskService } from './http/HttpTaskService';
import { httpUploadService } from './http/HttpUploadService';
import { mockUploadService } from './mock/MockUploadService';
import type {
  IAuthService,
  INotificationService,
  IProfileService,
  ISocialService,
  ITaskGroupService,
  ITaskService,
  IUploadService,
} from './types/index';

interface ServiceContainer {
  authService: IAuthService;
  profileService: IProfileService;
  socialService: ISocialService;
  taskGroupService: ITaskGroupService;
  taskService: ITaskService;
  notificationService: INotificationService;
  uploadService: IUploadService;
}

export const services: ServiceContainer = {
  authService: USE_HTTP_SERVICES ? httpAuthService : mockAuthService,
  profileService: USE_HTTP_SERVICES ? httpProfileService : mockProfileService,
  socialService: USE_HTTP_SERVICES ? httpSocialService : mockSocialService,
  taskGroupService: USE_HTTP_SERVICES ? httpTaskGroupService : mockTaskGroupService,
  taskService: USE_HTTP_SERVICES ? httpTaskService : mockTaskService,
  notificationService: USE_HTTP_SERVICES ? httpNotificationService : mockNotificationService,
  uploadService: USE_HTTP_SERVICES ? httpUploadService : mockUploadService,
};
