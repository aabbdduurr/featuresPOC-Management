import {
  PlatformService,
  GroupService,
  FeatureService,
  SegmentService,
  LogService,
} from '../../domain/services';
import {
  PlatformRepository,
  GroupRepository,
  FeatureRepository,
  SegmentRepository,
  LogRepository,
} from '../../infrastructure/repositories';
import { FetchHttpClient, StaticFileClient } from '../../infrastructure/api/httpClient';
import { API_ENDPOINTS } from '../constants';
import { getAuthToken } from '../utils/auth';

export interface ServiceContainer {
  platformService: PlatformService;
  groupService: GroupService;
  featureService: FeatureService;
  segmentService: SegmentService;
  logService: LogService;
}

export const createServiceContainer = async (): Promise<ServiceContainer> => {
  const authToken = await getAuthToken();
  const httpClient = new FetchHttpClient(API_ENDPOINTS.BASE_URL, authToken);
  const staticFileClient = new StaticFileClient(API_ENDPOINTS.STATIC_URL);

  const platformRepository = new PlatformRepository(staticFileClient);
  const groupRepository = new GroupRepository(httpClient);
  const featureRepository = new FeatureRepository(httpClient);
  const segmentRepository = new SegmentRepository(staticFileClient, httpClient);
  const logRepository = new LogRepository(staticFileClient);

  const platformService = new PlatformService(platformRepository);
  const groupService = new GroupService(groupRepository, platformRepository);
  const featureService = new FeatureService(featureRepository, platformRepository);
  const segmentService = new SegmentService(segmentRepository);
  const logService = new LogService(logRepository);

  return {
    platformService,
    groupService,
    featureService,
    segmentService,
    logService,
  };
};

let serviceContainer: ServiceContainer | null = null;
let serviceContainerPromise: Promise<ServiceContainer> | null = null;

export const getServiceContainer = (): ServiceContainer => {
  if (!serviceContainer) {
    const fallbackToken =
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSJ9LCJpYXQiOjE3NjQwNzc2OTUsImV4cCI6MTc2NDE2NDA5NX0.er4H4XqRhEgJOF3axEYBaR5yvD0Z36UeP1aRDBRZhGI';
    const httpClient = new FetchHttpClient(API_ENDPOINTS.BASE_URL, fallbackToken);
    const staticFileClient = new StaticFileClient(API_ENDPOINTS.STATIC_URL);

    const platformRepository = new PlatformRepository(staticFileClient);
    const groupRepository = new GroupRepository(httpClient);
    const featureRepository = new FeatureRepository(httpClient);
    const segmentRepository = new SegmentRepository(staticFileClient, httpClient);
    const logRepository = new LogRepository(staticFileClient);

    const platformService = new PlatformService(platformRepository);
    const groupService = new GroupService(groupRepository, platformRepository);
    const featureService = new FeatureService(featureRepository, platformRepository);
    const segmentService = new SegmentService(segmentRepository);
    const logService = new LogService(logRepository);

    serviceContainer = {
      platformService,
      groupService,
      featureService,
      segmentService,
      logService,
    };
  }
  return serviceContainer;
};

export const getServiceContainerAsync = async (): Promise<ServiceContainer> => {
  if (!serviceContainer && !serviceContainerPromise) {
    serviceContainerPromise = createServiceContainer();
    serviceContainer = await serviceContainerPromise;
  }
  return serviceContainer!;
};

export const setServiceContainer = (container: ServiceContainer): void => {
  serviceContainer = container;
  serviceContainerPromise = null;
};

export const resetServiceContainer = (): void => {
  serviceContainer = null;
  serviceContainerPromise = null;
};
