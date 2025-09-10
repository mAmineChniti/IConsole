import { env } from "@/env";
import { createSearchParams } from "@/lib/utils";
import type {
  AssignUserToProjectRequest,
  AttachPrivateNetworkRequest,
  ClusterActionRequest,
  ClusterCreateRequest,
  ClusterTokenRequest,
  CreateFromDescriptionRequest,
  CreateSnapshotRequest,
  FlavorCreateRequest,
  FlavorDeleteRequest,
  FlavorUpdateRequest,
  FloatingIPAssociateRequest,
  FloatingIPCreateRequest,
  FloatingIPIdRequest,
  FloatingIPRequest,
  IdRequest,
  ImageCreateVolumeRequest,
  ImageDeleteRequest,
  ImageImportFromNameRequest,
  ImageImportFromUploadRequest,
  ImageImportFromUrlRequest,
  ImageUpdateRequest,
  ImportVMwareRequest,
  InstanceDeleteRequest,
  InstanceRebootRequest,
  InstanceStartRequest,
  InstanceStopRequest,
  InterfaceRequest,
  KeyPairCreateRequest,
  KeyPairDeleteRequest,
  KeyPairImportFromFileRequest,
  LoginRequest,
  NetworkCreateRequest,
  NetworkIdRequest,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  RemoveRouterInterfaceRequest,
  RemoveUserFromProjectRequest,
  ResizeRequest,
  RouterCreateRequest,
  RouterIdRequest,
  ScaleNodeRequest,
  SecurityGroupCreateRequest,
  SecurityGroupDeleteRequest,
  SecurityGroupRuleCreateRequest,
  SecurityGroupRuleDeleteRequest,
  SecurityGroupUpdateRequest,
  SwitchProjectRequest,
  UpdateUserRolesRequest,
  UserCreateRequest,
  UserUpdateRequest,
  VMCreateRequest,
  VolumeAttachRequest,
  VolumeChangeTypeRequest,
  VolumeCreateFromSnapshotRequest,
  VolumeCreateRequest,
  VolumeDeleteRequest,
  VolumeDetachRequest,
  VolumeExtendRequest,
  VolumeRequest,
  VolumeSnapshotCreateRequest,
  VolumeSnapshotDeleteRequest,
  VolumeSnapshotUpdateRequest,
  VolumeTypeCreateRequest,
  VolumeTypeUpdateRequest,
  VolumeUploadToImageRequest,
} from "@/types/RequestInterfaces";
import type {
  AssignUserResponse,
  AttachedVolumesResponse,
  AvailableVolumesResponse,
  ClusterActionResponse,
  ClusterDashboardTokenResponse,
  ClusterDetails,
  ClusterListResponse,
  ConsoleResponse,
  CreateFromDescriptionResponse,
  DashboardOverviewResponse,
  DebugRoleAssignmentsResponse,
  FlavorActionResponse,
  FlavorDetails,
  FlavorListResponse,
  FloatingIpsListResponse,
  GetLogsResponse,
  ImageDeleteResponse,
  ImageDetails,
  ImageImportFromNameResponse,
  ImageImportFromUploadResponse,
  ImageImportFromUrlResponse,
  ImageListResponse,
  InstanceListResponse,
  KeyPairCreateResponse,
  KeyPairDeleteResponse,
  KeyPairDetails,
  KeyPairImportResponse,
  KeyPairListResponse,
  LoginResponse,
  LogoutResponse,
  NetworkCreateResponse,
  NetworkDeleteResponse,
  NetworkDetails,
  NetworkListResponse,
  NovaActionResponse,
  ProjectDeleteResponse,
  ProjectDetailsResponse,
  ProjectListResponse,
  ProjectsResponse,
  PublicPrivateNetworksResponse,
  QemuImgCheckResponse,
  RemoveUserResponse,
  ResourcesResponse,
  RolesResponse,
  RouterCreateResponse,
  RouterDetails,
  RouterInterfacesResponse,
  RouterListResponse,
  ScaleHealthResponse,
  ScaleNodeResponse,
  SecurityGroup,
  SecurityGroupCreateResponse,
  SecurityGroupDeleteResponse,
  SecurityGroupListResponse,
  SecurityGroupRuleCreateResponse,
  SecurityGroupRuleListResponse,
  UnassignedUsersResponse,
  UpdateUserRolesResponse,
  UserCreateResponse,
  UserDeleteResponse,
  UserDetailsResponse,
  UserListResponse,
  VMCreateResponse,
  VMListResponse,
  VMwareImportResponse,
  VolumeActionResponse,
  VolumeAttachedInstancesResponse,
  VolumeAttachmentsDetailsResponse,
  VolumeAvailableInstancesResponse,
  VolumeDetails,
  VolumeGetDetails,
  VolumeListResponse,
  VolumeSnapshotDetails,
  VolumeSnapshotListResponse,
  VolumeType,
  VolumeTypeListResponse,
} from "@/types/ResponseInterfaces";
import { TFetchClient } from "@thatguyjamal/type-fetch";
import { getCookie } from "cookies-next";

const API_CONFIG = {
  BASE_URL: env.NEXT_PUBLIC_BACKEND ?? "http://127.0.0.1:8000/api/v1",
  VOLUME: {
    BASE: "/volume/volumes",
    SNAPSHOTS: "/volume/snapshots",
    TYPES: "/volume/volume-types/list",
    TYPES_CREATE: "/volume/volume-types/create",
    TYPES_UPDATE: "/volume/volume-types/update/",
    TYPES_DELETE: "/volume/volume-types/delete/",
    ATTACH: "/volume/volumes",
    DETACH: "/volume/volumes/attachments",
    ATTACHMENTS: "/volume/volumes",
    AVAILABLE_INSTANCES: "/volume/volumes",
    ATTACHED_INSTANCES: "/volume/volumes",
  },
  FLAVOR: {
    BASE: "/flavor/flavors",
    FULL_UPDATE: "/flavor/flavors/",
  },
  SECURITY_GROUP: {
    BASE: "/securitygroups/security-groups",
    RULES: "/securitygroups/security-groups/",
    DELETE_RULE: "/securitygroups/security-groups/rules/",
  },
  AUTH: {
    LOGIN: "/auth/login",
    SWITCH_PROJECT: "/auth/switch-project",
    PROJECTS: "/auth/projects",
    LOGOUT: "/auth/logout",
  },
  INFRA: {
    INSTANCES: "/nova/instances",
    INSTANCE_DETAILS: "/nova/servers",
    CREATE_VM: "/nova/create-vm",
    CREATE_FROM_DESCRIPTION: "/nova/create-from-description",
    IMPORT_VMWARE: "/nova/import-vmware-vm",
    START_INSTANCE: "/nova/start",
    STOP_INSTANCE: "/nova/stop",
    REBOOT_INSTANCE: "/nova/reboot",
    DELETE_INSTANCE: "/nova/delete",
    RESOURCES: "/nova/resources",
    CHECK_QEMU: "/nova/check-qemu-img",
    OVERVIEW: "/dashboard/overview",
    RESIZE: "/nova/resize",
    PAUSE: "/nova/pause",
    SUSPEND: "/nova/suspend",
    SHELVE: "/nova/shelve",
    RESCUE: "/nova/rescue",
    CONSOLE: "/nova/console",
    LOGS: "/nova/logs",
    SNAPSHOT: "/nova/snapshot",
    FLOATING_ATTACH: "/nova/attach",
    FLOATING_DETACH: "/nova/detach",
    INTERFACE_ATTACH: "/nova/interface/attach",
    INTERFACE_DETACH: "/nova/interface/detach",
    VOLUMES_AVAILABLE: "/nova/volumes_avaible/list",
    VOLUMES_ATTACHED: "/nova/volumes/attached",
    VOLUME_ATTACH: "/nova/volume/attach",
    VOLUME_DETACH: "/nova/volume/detach",
  },
  PROJECTS: {
    BASE: "/projects",
    ASSIGN_USER: "/projects/assign-user",
    REMOVE_USER: "/projects/remove-user",
    UPDATE_USER_ROLES: "/projects/update-user-roles",
  },
  USERS: {
    BASE: "/users/users",
    ROLES: "/users/roles",
    DEBUG_ROLE_ASSIGNMENTS: "/users/debug_role_assignments",
    PROJECTS: "/users/projects",
  },
  IMAGE: {
    BASE: "/image/images",
    IMPORT_FROM_URL: "/image/images/import-from-url",
    IMPORT_FROM_NAME: "/image/images/import-from-name",
    IMPORT_FROM_UPLOAD: "/image/images/import-from-upload",
    VOLUMES: "/image/volumes",
  },
  NETWORK: {
    BASE: "/network/network",
    NETWORKS: "/network/networks",
    LIST: "/network/list",
    CREATE: "/network/networks/create",
    DELETE: "/network/delete",
    ROUTER: "/network/router",
    ROUTERS: "/network/routers",
    FLOATING_IPS: "/network/floatingips",
    VMS: "/network/vms",
  },
  SCALE: {
    HEALTH: "/scale/",
    NODE: "/scale/node",
  },
  KEYPAIRS: {
    BASE: "/keypairs/keypairs",
    CREATE: "/keypairs/keypairs/create",
    IMPORT_FROM_FILE: "/keypairs/keypairs/import-from-file",
  },
  CLUSTER: {
    CREATE_AUTO: "/cluster/create-vm-cluster-auto",
    REMOVE_SSH_KEY: "/cluster/remove-ssh-key",
    DASHBOARD_TOKEN: "/cluster/k8s-dashboard/token",
    CLUSTERS: "/cluster/clusters",
    START: "/cluster/clusters/start",
    STOP: "/cluster/clusters/stop",
    DELETE: "/cluster/clusters/delete",
  },
} as const;

const client = new TFetchClient();

type TokenCookie = {
  token: string;
  expires_at: string;
  expires_at_ts: number;
};

const isTokenCookie = (v: unknown): v is TokenCookie =>
  typeof v === "object" &&
  v !== undefined &&
  typeof (v as Record<string, unknown>).token === "string" &&
  typeof (v as Record<string, unknown>).expires_at === "string" &&
  typeof (v as Record<string, unknown>).expires_at_ts === "number";

const authHeaders = (): Record<string, string> => {
  const raw = getCookie("token");
  if (!raw || typeof raw !== "string") return {};

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isTokenCookie(parsed)) {
      const expMs =
        parsed.expires_at_ts > 1e12
          ? parsed.expires_at_ts
          : parsed.expires_at_ts * 1000;
      if (Date.now() >= expMs) return {};
      return { Authorization: `Bearer ${parsed.token}` };
    }
  } catch {}

  if (raw.trim().length > 0) {
    return { Authorization: `Bearer ${raw}` };
  }
  return {};
};

export const AuthService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const result = await client.post<LoginResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.AUTH.LOGIN,
      { type: "json", data },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async switchProject(data: SwitchProjectRequest): Promise<LoginResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<LoginResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.AUTH.SWITCH_PROJECT,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async getProjects(): Promise<ProjectsResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<ProjectsResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.AUTH.PROJECTS,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async logout(): Promise<LogoutResponse> {
    const result = await client.post<LogoutResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.AUTH.LOGOUT,
      { type: "json", data: {} },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
};

export const ProjectService = {
  async list(): Promise<ProjectListResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<ProjectListResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.PROJECTS.BASE + "/",
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async create(data: ProjectCreateRequest): Promise<ProjectDetailsResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<ProjectDetailsResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.PROJECTS.BASE,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async get(projectId: string): Promise<ProjectDetailsResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<ProjectDetailsResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.PROJECTS.BASE + `/${projectId}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async getUnassignedUsers(
    projectId: string,
  ): Promise<UnassignedUsersResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<UnassignedUsersResponse>(
      API_CONFIG.BASE_URL +
        API_CONFIG.PROJECTS.BASE +
        `/${projectId}/unassigned_users`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async assignUser(
    data: AssignUserToProjectRequest,
  ): Promise<AssignUserResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<AssignUserResponse>(
      API_CONFIG.BASE_URL +
        API_CONFIG.PROJECTS.BASE +
        API_CONFIG.PROJECTS.ASSIGN_USER,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async removeUser(
    data: RemoveUserFromProjectRequest,
  ): Promise<RemoveUserResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<RemoveUserResponse>(
      API_CONFIG.BASE_URL +
        API_CONFIG.PROJECTS.BASE +
        API_CONFIG.PROJECTS.REMOVE_USER,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async updateUserRoles(
    data: UpdateUserRolesRequest,
  ): Promise<UpdateUserRolesResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.put<UpdateUserRolesResponse>(
      API_CONFIG.BASE_URL +
        API_CONFIG.PROJECTS.BASE +
        API_CONFIG.PROJECTS.UPDATE_USER_ROLES,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async update(
    projectId: string,
    data: ProjectUpdateRequest,
  ): Promise<ProjectDetailsResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.put<ProjectDetailsResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.PROJECTS.BASE + `/${projectId}`,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async delete(projectId: string): Promise<ProjectDeleteResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.delete<ProjectDeleteResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.PROJECTS.BASE + `/${projectId}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
};

export const UserService = {
  async create(data: UserCreateRequest): Promise<UserCreateResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<UserCreateResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.USERS.BASE,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async list(): Promise<UserListResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<UserListResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.USERS.BASE,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async get(userId: string): Promise<UserDetailsResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<UserDetailsResponse>(
      API_CONFIG.BASE_URL + `${API_CONFIG.USERS.BASE}/${userId}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async update(
    userId: string,
    data: UserUpdateRequest,
  ): Promise<UserDetailsResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.put<UserDetailsResponse>(
      API_CONFIG.BASE_URL + `${API_CONFIG.USERS.BASE}/${userId}`,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async delete(userId: string): Promise<UserDeleteResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.delete<UserDeleteResponse>(
      API_CONFIG.BASE_URL + `${API_CONFIG.USERS.BASE}/${userId}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async getRoles(): Promise<RolesResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<RolesResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.USERS.ROLES,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async debugRoleAssignments(
    userId: string,
  ): Promise<DebugRoleAssignmentsResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<DebugRoleAssignmentsResponse>(
      API_CONFIG.BASE_URL +
        API_CONFIG.USERS.DEBUG_ROLE_ASSIGNMENTS +
        `/${userId}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async listUserProjects(): Promise<ProjectListResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<ProjectListResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.USERS.PROJECTS,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
};

export const ImageService = {
  async importFromUrl(
    params: ImageImportFromUrlRequest,
  ): Promise<ImageImportFromUrlResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const url =
      API_CONFIG.BASE_URL +
      API_CONFIG.IMAGE.IMPORT_FROM_URL +
      `?image_url=${encodeURIComponent(params.image_url)}&image_name=${encodeURIComponent(params.image_name)}${params.visibility ? `&visibility=${params.visibility}` : ""}`;
    const result = await client.post<ImageImportFromUrlResponse>(
      url,
      {
        type: "json",
        data: {},
      },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async importFromName(
    params: ImageImportFromNameRequest,
  ): Promise<ImageImportFromNameResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const url =
      API_CONFIG.BASE_URL +
      API_CONFIG.IMAGE.IMPORT_FROM_NAME +
      `?description=${encodeURIComponent(params.description)}${params.visibility ? `&visibility=${params.visibility}` : ""}&protected=${params.protected}`;
    const result = await client.post<ImageImportFromNameResponse>(
      url,
      {
        type: "json",
        data: {},
      },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async listImages(): Promise<ImageListResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const url = API_CONFIG.BASE_URL + "/image/images";
    const result = await client.get<ImageListResponse>(url, { headers: token });
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async getImageDetails(imageId: string): Promise<ImageDetails> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const url = API_CONFIG.BASE_URL + `/image/images/${imageId}`;
    const result = await client.get<ImageDetails>(url, { headers: token });
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async deleteImage(data: ImageDeleteRequest): Promise<ImageDeleteResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const url = API_CONFIG.BASE_URL + `/image/images/${data.image_id}`;
    const result = await client.delete<ImageDeleteResponse>(url, {
      headers: token,
    });
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async importFromUpload(
    data: ImageImportFromUploadRequest,
  ): Promise<ImageImportFromUploadResponse> {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("image_name", data.image_name);
    if (data.visibility) formData.append("visibility", data.visibility);
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const url = API_CONFIG.BASE_URL + "/image/images/import-from-upload";
    const result = await client.post<ImageImportFromUploadResponse>(
      url,
      { type: "form", data: formData },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async createVolume(data: ImageCreateVolumeRequest): Promise<VolumeDetails> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const params = new URLSearchParams();
    params.set("name", data.name);
    params.set("size", String(data.size));
    params.set("image_id", data.image_id);
    if (data.volume_type) params.set("volume_type", data.volume_type);
    if (data.visibility) params.set("visibility", data.visibility);
    if (typeof data.protected === "boolean")
      params.set("protected", String(data.protected));
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.IMAGE.VOLUMES}?${params.toString()}`;
    const result = await client.post<VolumeDetails>(
      url,
      { type: "json", data: {} },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async updateImage(
    imageId: string,
    data: ImageUpdateRequest,
  ): Promise<ImageDetails> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const url = API_CONFIG.BASE_URL + `/image/images/${imageId}/update`;
    const result = await client.put<ImageDetails>(
      url,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
};

export const NetworkService = {
  async list(): Promise<NetworkListResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<NetworkListResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.NETWORK.LIST,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async get(data: NetworkIdRequest): Promise<NetworkDetails> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<NetworkDetails>(
      API_CONFIG.BASE_URL + API_CONFIG.NETWORK.BASE + `/${data.network_id}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async create(data: NetworkCreateRequest): Promise<NetworkCreateResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<NetworkCreateResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.NETWORK.CREATE,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async delete(data: NetworkIdRequest): Promise<NetworkDeleteResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.delete<NetworkDeleteResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.NETWORK.DELETE + `/${data.network_id}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async publicNetworks(): Promise<PublicPrivateNetworksResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<PublicPrivateNetworksResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.NETWORK.NETWORKS + "/public",
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async privateNetworks(): Promise<PublicPrivateNetworksResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<PublicPrivateNetworksResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.NETWORK.NETWORKS + "/private",
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async createRouter(data: RouterCreateRequest): Promise<RouterCreateResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<RouterCreateResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.NETWORK.ROUTER + "/create",
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async attachPrivateNetwork(
    data: AttachPrivateNetworkRequest,
  ): Promise<unknown> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<unknown>(
      API_CONFIG.BASE_URL +
        API_CONFIG.NETWORK.ROUTER +
        "/attach-private-network",
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async routersList(): Promise<RouterListResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<RouterListResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.NETWORK.ROUTERS,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async getRouter(data: RouterIdRequest): Promise<RouterDetails> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<RouterDetails>(
      API_CONFIG.BASE_URL + API_CONFIG.NETWORK.ROUTER + `/${data.router_id}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async getRouterInterfaces(
    data: RouterIdRequest,
  ): Promise<RouterInterfacesResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<RouterInterfacesResponse>(
      API_CONFIG.BASE_URL +
        API_CONFIG.NETWORK.ROUTER +
        `/${data.router_id}/interfaces`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async removeRouterInterface(
    data: RemoveRouterInterfaceRequest,
  ): Promise<unknown> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<unknown>(
      API_CONFIG.BASE_URL + API_CONFIG.NETWORK.ROUTER + "/remove-interface",
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async listFloatingIPs(): Promise<FloatingIpsListResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<FloatingIpsListResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.NETWORK.FLOATING_IPS,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async createFloatingIP(data: FloatingIPCreateRequest): Promise<unknown> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<unknown>(
      API_CONFIG.BASE_URL + API_CONFIG.NETWORK.FLOATING_IPS + "/create",
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async deleteFloatingIP(data: FloatingIPIdRequest): Promise<unknown> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<unknown>(
      API_CONFIG.BASE_URL + API_CONFIG.NETWORK.FLOATING_IPS + "/delete",
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async listVMS(): Promise<VMListResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<VMListResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.NETWORK.VMS,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async dissociateFloatingIP(data: FloatingIPIdRequest): Promise<unknown> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<unknown>(
      API_CONFIG.BASE_URL + API_CONFIG.NETWORK.FLOATING_IPS + "/dissociate",
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async associateFloatingIP(
    data: FloatingIPAssociateRequest,
  ): Promise<unknown> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<unknown>(
      API_CONFIG.BASE_URL + API_CONFIG.NETWORK.FLOATING_IPS + "/associate",
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
};
export const InfraService = {
  async listInstances(): Promise<InstanceListResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<InstanceListResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.INSTANCES,
      { headers: token },
    );
    if (result.error) {
      throw new Error(`Error fetching instances: ${result.error.message}`);
    }
    if (!result.data) {
      throw new Error("No data received from instances endpoint");
    }
    return result.data;
  },

  async createVM(vmData: VMCreateRequest): Promise<VMCreateResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<VMCreateResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.CREATE_VM,
      { type: "json", data: vmData },
      { headers: token },
    );
    if (result.error) {
      throw new Error(`Error creating VM: ${result.error.message}`);
    }
    if (!result.data) {
      throw new Error("No data received from create VM endpoint");
    }
    return result.data;
  },
  async createFromDescription(
    data: CreateFromDescriptionRequest,
  ): Promise<CreateFromDescriptionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<CreateFromDescriptionResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.CREATE_FROM_DESCRIPTION,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) {
      throw new Error(
        `Error creating from description: ${result.error.message}`,
      );
    }
    if (!result.data) {
      throw new Error("No data received from create-from-description endpoint");
    }
    return result.data;
  },
  async checkQemuImg(): Promise<QemuImgCheckResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<QemuImgCheckResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.CHECK_QEMU,
      { headers: token },
    );
    if (result.error) {
      throw new Error(`Error checking qemu-img: ${result.error.message}`);
    }
    if (!result.data) {
      throw new Error("No data received from qemu check endpoint");
    }
    return result.data;
  },

  async importVMwareVM(
    data: ImportVMwareRequest,
  ): Promise<VMwareImportResponse> {
    const formData = new FormData();
    formData.append("vmdk_file", data.vmdk_file);
    formData.append("vm_name", data.vm_name);
    if (data.description) formData.append("description", data.description);
    if (typeof data.min_disk === "number")
      formData.append("min_disk", data.min_disk.toString());
    if (typeof data.min_ram === "number")
      formData.append("min_ram", data.min_ram.toString());
    formData.append("is_public", (data.is_public ?? false).toString());
    formData.append("flavor_id", data.flavor_id);
    formData.append("network_id", data.network_id);
    formData.append("key_name", data.key_name);
    formData.append("security_group", data.security_group);
    if (data.admin_password)
      formData.append("admin_password", data.admin_password);
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<VMwareImportResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.IMPORT_VMWARE,
      { type: "form", data: formData },
      { headers: token },
    );
    if (result.error) {
      throw new Error(`Error importing VMware VM: ${result.error.message}`);
    }
    if (!result.data) {
      throw new Error("No data received from import VMware VM endpoint");
    }
    return result.data;
  },

  async listResources(): Promise<ResourcesResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<ResourcesResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.RESOURCES,
      { headers: token },
    );
    if (result.error) {
      throw new Error(`Error fetching resources: ${result.error.message}`);
    }
    if (!result.data) {
      throw new Error("No data received from resources endpoint");
    }
    return result.data;
  },

  async startInstance(data: InstanceStartRequest): Promise<NovaActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<NovaActionResponse>(
      API_CONFIG.BASE_URL +
        API_CONFIG.INFRA.START_INSTANCE +
        `/${data.server_id}`,
      { type: "json", data: {} },
      { headers: token },
    );
    if (result.error) {
      throw new Error(`Error starting instance: ${result.error.message}`);
    }
    if (!result.data) {
      throw new Error("No data received from start instance endpoint");
    }
    return result.data;
  },

  async stopInstance(data: InstanceStopRequest): Promise<NovaActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<NovaActionResponse>(
      API_CONFIG.BASE_URL +
        API_CONFIG.INFRA.STOP_INSTANCE +
        `/${data.server_id}`,
      { type: "json", data: {} },
      { headers: token },
    );
    if (result.error) {
      throw new Error(`Error stopping instance: ${result.error.message}`);
    }
    if (!result.data) {
      throw new Error("No data received from stop instance endpoint");
    }
    return result.data;
  },

  async rebootInstance(
    data: InstanceRebootRequest,
  ): Promise<NovaActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<NovaActionResponse>(
      API_CONFIG.BASE_URL +
        API_CONFIG.INFRA.REBOOT_INSTANCE +
        `/${data.server_id}`,
      { type: "json", data: {} },
      { headers: token },
    );
    if (result.error) {
      throw new Error(`Error rebooting instance: ${result.error.message}`);
    }
    if (!result.data) {
      throw new Error("No data received from reboot instance endpoint");
    }
    return result.data;
  },

  async deleteInstance(
    data: InstanceDeleteRequest,
  ): Promise<NovaActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.delete<NovaActionResponse>(
      API_CONFIG.BASE_URL +
        API_CONFIG.INFRA.DELETE_INSTANCE +
        `/${data.server_id}`,
      { headers: token },
    );
    if (result.error) {
      throw new Error(`Error deleting instance: ${result.error.message}`);
    }
    if (!result.data) {
      throw new Error("No data received from delete instance endpoint");
    }
    return result.data;
  },

  async getOverview(): Promise<DashboardOverviewResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<DashboardOverviewResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.OVERVIEW,
      { headers: token },
    );
    if (result.error) {
      throw new Error(`Error fetching overview: ${result.error.message}`);
    }
    if (!result.data) {
      throw new Error("No data received from overview endpoint");
    }
    return result.data;
  },
  async createSnapshot(
    data: CreateSnapshotRequest,
  ): Promise<NovaActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<NovaActionResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.SNAPSHOT,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async resize(data: ResizeRequest): Promise<NovaActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<NovaActionResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.RESIZE,
      { type: "json", data },
      { headers: token },
    );
    if (result.error)
      throw new Error(`Error resizing instance: ${result.error.message}`);
    if (!result.data) throw new Error("No data received from resize endpoint");
    return result.data;
  },

  async pause(data: IdRequest): Promise<NovaActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<NovaActionResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.PAUSE,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async suspend(data: IdRequest): Promise<NovaActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<NovaActionResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.SUSPEND,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async shelve(data: IdRequest): Promise<NovaActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<NovaActionResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.SHELVE,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async rescue(data: IdRequest): Promise<NovaActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<NovaActionResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.RESCUE,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async getConsole(data: IdRequest): Promise<ConsoleResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<ConsoleResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.CONSOLE,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    if (!result.data?.url) throw new Error("No console URL returned");
    return result.data;
  },

  async getLogs(data: IdRequest): Promise<GetLogsResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<GetLogsResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.LOGS,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async attachFloatingIp(data: FloatingIPRequest): Promise<NovaActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<NovaActionResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.FLOATING_ATTACH,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async detachFloatingIp(data: FloatingIPRequest): Promise<NovaActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<NovaActionResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.FLOATING_DETACH,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async attachInterface(data: InterfaceRequest): Promise<NovaActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<NovaActionResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.INTERFACE_ATTACH,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async detachInterface(data: InterfaceRequest): Promise<NovaActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<NovaActionResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.INTERFACE_DETACH,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async listAvailableVolumes(): Promise<AvailableVolumesResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<AvailableVolumesResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.VOLUMES_AVAILABLE,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async listAttachedVolumes(data: IdRequest): Promise<AttachedVolumesResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<AttachedVolumesResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.VOLUMES_ATTACHED,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async attachVolume(data: VolumeRequest): Promise<NovaActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<NovaActionResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.VOLUME_ATTACH,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async detachVolume(data: VolumeRequest): Promise<NovaActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<NovaActionResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.VOLUME_DETACH,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
};

export const ScaleService = {
  async health(): Promise<ScaleHealthResponse> {
    const result = await client.get<ScaleHealthResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.SCALE.HEALTH,
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async addNode(data: ScaleNodeRequest): Promise<ScaleNodeResponse> {
    const result = await client.post<ScaleNodeResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.SCALE.NODE,
      { type: "json", data },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
};

export const FlavorService = {
  async create(data: FlavorCreateRequest): Promise<FlavorDetails> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<FlavorDetails>(
      API_CONFIG.BASE_URL + API_CONFIG.FLAVOR.BASE,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async list(): Promise<FlavorListResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<FlavorListResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.FLAVOR.BASE,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async get(flavorId: string): Promise<FlavorDetails> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<FlavorDetails>(
      API_CONFIG.BASE_URL + API_CONFIG.FLAVOR.BASE + `/${flavorId}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async update(data: FlavorUpdateRequest): Promise<FlavorDetails> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const params = new URLSearchParams();
    if (typeof data.name === "string") params.set("name", data.name);
    if (typeof data.vcpus === "number") params.set("vcpus", String(data.vcpus));
    if (typeof data.ram === "number") params.set("ram", String(data.ram));
    if (typeof data.disk === "number") params.set("disk", String(data.disk));
    if (typeof data.ephemeral === "number")
      params.set("ephemeral", String(data.ephemeral));
    if (typeof data.swap === "number") params.set("swap", String(data.swap));
    if (typeof data.is_public === "boolean")
      params.set("is_public", String(data.is_public));
    if (typeof data.description === "string")
      params.set("description", data.description);

    const url =
      API_CONFIG.BASE_URL +
      API_CONFIG.FLAVOR.FULL_UPDATE +
      `${data.flavor_id}/full-update` +
      (params.toString() ? `?${params.toString()}` : "");
    const result = await client.put<FlavorDetails>(
      url,
      { type: "json", data: {} },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async delete(data: FlavorDeleteRequest): Promise<FlavorActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.delete<FlavorActionResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.FLAVOR.BASE + `/${data.flavor_id}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
};

export const VolumeService = {
  async list(): Promise<VolumeListResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<VolumeListResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.VOLUME.BASE,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async create(data: VolumeCreateRequest): Promise<VolumeDetails> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");

    const params = createSearchParams(data);
    const result = await client.post<VolumeDetails>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.VOLUME.BASE}?${params.toString()}`,
      { type: "json", data: {} },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async get(volumeId: string): Promise<VolumeGetDetails> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<VolumeGetDetails>(
      API_CONFIG.BASE_URL + `${API_CONFIG.VOLUME.BASE}/${volumeId}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async delete(data: VolumeDeleteRequest): Promise<VolumeActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.delete<VolumeActionResponse>(
      API_CONFIG.BASE_URL + `${API_CONFIG.VOLUME.BASE}/${data.volume_id}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async extend(data: VolumeExtendRequest): Promise<VolumeActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.put<VolumeActionResponse>(
      API_CONFIG.BASE_URL +
        `${API_CONFIG.VOLUME.BASE}/${data.volume_id}/extend`,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async attach(data: VolumeAttachRequest): Promise<VolumeActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const url =
      API_CONFIG.BASE_URL +
      `${API_CONFIG.VOLUME.ATTACH}/${data.volume_id}/attach?instance_id=${encodeURIComponent(data.instance_id)}`;
    const result = await client.post<VolumeActionResponse>(
      url,
      { type: "json", data: {} },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async detach(data: VolumeDetachRequest): Promise<VolumeActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<VolumeActionResponse>(
      API_CONFIG.BASE_URL +
        `${API_CONFIG.VOLUME.DETACH}/${data.attachment_id}/detach`,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async changeType(
    data: VolumeChangeTypeRequest,
    volumeId: string,
  ): Promise<VolumeActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.put<VolumeActionResponse>(
      API_CONFIG.BASE_URL + `${API_CONFIG.VOLUME.BASE}/${volumeId}/change-type`,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async uploadToImage(
    data: VolumeUploadToImageRequest,
  ): Promise<VolumeActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<VolumeActionResponse>(
      API_CONFIG.BASE_URL +
        `${API_CONFIG.VOLUME.BASE}/${data.volume_id}/upload-to-image`,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async createSnapshot(
    data: VolumeSnapshotCreateRequest,
  ): Promise<VolumeActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const params = new URLSearchParams();
    params.set("name", data.name);
    if (data.description) params.set("description", data.description);
    const url =
      API_CONFIG.BASE_URL +
      `${API_CONFIG.VOLUME.BASE}/${data.volume_id}/snapshot?${params.toString()}`;
    const result = await client.post<VolumeActionResponse>(
      url,
      { type: "json", data: {} },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async deleteSnapshot(
    data: VolumeSnapshotDeleteRequest,
  ): Promise<VolumeActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.delete<VolumeActionResponse>(
      API_CONFIG.BASE_URL +
        `${API_CONFIG.VOLUME.SNAPSHOTS}/${data.snapshot_id}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async listSnapshots(): Promise<VolumeSnapshotListResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<VolumeSnapshotListResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.VOLUME.SNAPSHOTS,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async getSnapshotDetails(snapshotId: string): Promise<VolumeSnapshotDetails> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<VolumeSnapshotDetails>(
      API_CONFIG.BASE_URL + `${API_CONFIG.VOLUME.SNAPSHOTS}/${snapshotId}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async listTypes(): Promise<VolumeTypeListResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<VolumeTypeListResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.VOLUME.TYPES,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async getAvailableInstances(
    volumeId: string,
  ): Promise<VolumeAvailableInstancesResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<VolumeAvailableInstancesResponse>(
      API_CONFIG.BASE_URL +
        `${API_CONFIG.VOLUME.AVAILABLE_INSTANCES}/${volumeId}/available-instances`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async getAttachedInstances(
    volumeId: string,
  ): Promise<VolumeAttachedInstancesResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<VolumeAttachedInstancesResponse>(
      API_CONFIG.BASE_URL +
        `${API_CONFIG.VOLUME.ATTACHED_INSTANCES}/${volumeId}/attached-instances`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async getAttachments(
    volumeId: string,
  ): Promise<VolumeAttachmentsDetailsResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<VolumeAttachmentsDetailsResponse>(
      API_CONFIG.BASE_URL +
        `${API_CONFIG.VOLUME.ATTACHMENTS}/${volumeId}/attachement`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async createVolumeFromSnapshot(
    data: VolumeCreateFromSnapshotRequest,
  ): Promise<VolumeActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<VolumeActionResponse>(
      API_CONFIG.BASE_URL +
        `${API_CONFIG.VOLUME.SNAPSHOTS}/${data.snapshot_id}/create-volume`,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async updateSnapshot(
    data: VolumeSnapshotUpdateRequest,
    snapshotId: string,
  ): Promise<VolumeActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.put<VolumeActionResponse>(
      API_CONFIG.BASE_URL + `${API_CONFIG.VOLUME.SNAPSHOTS}/${snapshotId}`,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async listVolumeTypes(): Promise<VolumeType[]> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<VolumeType[]>(
      API_CONFIG.BASE_URL + API_CONFIG.VOLUME.TYPES,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async createVolumeType(data: VolumeTypeCreateRequest): Promise<VolumeType> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<VolumeType>(
      API_CONFIG.BASE_URL + API_CONFIG.VOLUME.TYPES_CREATE,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async updateVolumeType(data: VolumeTypeUpdateRequest): Promise<VolumeType> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.put<VolumeType>(
      API_CONFIG.BASE_URL +
        `${API_CONFIG.VOLUME.TYPES_UPDATE}${data.volume_type_id}`,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async deleteVolumeType(volumeTypeId: string): Promise<VolumeActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.delete<VolumeActionResponse>(
      API_CONFIG.BASE_URL + `${API_CONFIG.VOLUME.TYPES_DELETE}${volumeTypeId}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
};

export const SecurityGroupService = {
  async list(): Promise<SecurityGroupListResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<SecurityGroupListResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.SECURITY_GROUP.BASE,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async get(securityGroupId: string): Promise<SecurityGroup> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<SecurityGroup>(
      API_CONFIG.BASE_URL +
        `${API_CONFIG.SECURITY_GROUP.BASE}/${securityGroupId}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async create(
    data: SecurityGroupCreateRequest,
  ): Promise<SecurityGroupCreateResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<SecurityGroupCreateResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.SECURITY_GROUP.BASE,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async update(
    data: SecurityGroupUpdateRequest,
    securityGroupId: string,
  ): Promise<SecurityGroup> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.put<SecurityGroup>(
      API_CONFIG.BASE_URL +
        `${API_CONFIG.SECURITY_GROUP.BASE}/${securityGroupId}`,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async delete(
    data: SecurityGroupDeleteRequest,
  ): Promise<SecurityGroupDeleteResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.delete<SecurityGroupDeleteResponse>(
      API_CONFIG.BASE_URL +
        `${API_CONFIG.SECURITY_GROUP.BASE}/${data.security_group_id}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async addRule(
    data: SecurityGroupRuleCreateRequest,
    securityGroupId: string,
  ): Promise<SecurityGroupRuleCreateResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<SecurityGroupRuleCreateResponse>(
      API_CONFIG.BASE_URL +
        `${API_CONFIG.SECURITY_GROUP.RULES}${securityGroupId}/rules`,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async listRules(
    securityGroupId: string,
  ): Promise<SecurityGroupRuleListResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<SecurityGroupRuleListResponse>(
      API_CONFIG.BASE_URL +
        `${API_CONFIG.SECURITY_GROUP.RULES}${securityGroupId}/rules`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async deleteRule(data: SecurityGroupRuleDeleteRequest): Promise<unknown> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.delete<unknown>(
      API_CONFIG.BASE_URL +
        `${API_CONFIG.SECURITY_GROUP.DELETE_RULE}${data.rule_id}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
};

export const KeyPairService = {
  async list(): Promise<KeyPairListResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<KeyPairListResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.KEYPAIRS.BASE,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async create(data: KeyPairCreateRequest): Promise<KeyPairCreateResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<KeyPairCreateResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.KEYPAIRS.CREATE,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async importFromFile(
    data: KeyPairImportFromFileRequest,
  ): Promise<KeyPairImportResponse> {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("file", data.public_key);
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<KeyPairImportResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.KEYPAIRS.IMPORT_FROM_FILE,
      { type: "form", data: formData },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async get(name: string): Promise<KeyPairDetails> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<KeyPairDetails>(
      API_CONFIG.BASE_URL + `${API_CONFIG.KEYPAIRS.BASE}/${name}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async delete(data: KeyPairDeleteRequest): Promise<KeyPairDeleteResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.delete<KeyPairDeleteResponse>(
      API_CONFIG.BASE_URL + `${API_CONFIG.KEYPAIRS.BASE}/${data.name}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
};

export const ClusterService = {
  async createAuto(data: ClusterCreateRequest): Promise<ClusterActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");

    let url = API_CONFIG.BASE_URL + API_CONFIG.CLUSTER.CREATE_AUTO;
    const searchParams = new URLSearchParams();

    if (data.password) {
      searchParams.append("password", data.password);
      delete data.password;
    }

    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const result = await client.post<ClusterActionResponse>(
      url,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async getDashboardToken(
    data: ClusterTokenRequest,
  ): Promise<ClusterDashboardTokenResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<ClusterDashboardTokenResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.CLUSTER.DASHBOARD_TOKEN,
      { type: "json", data },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async list(): Promise<ClusterListResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<ClusterListResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.CLUSTER.CLUSTERS,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async get(clusterId: number): Promise<ClusterDetails> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.get<ClusterDetails>(
      API_CONFIG.BASE_URL + `${API_CONFIG.CLUSTER.CLUSTERS}/${clusterId}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async start(data: ClusterActionRequest): Promise<ClusterActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<ClusterActionResponse>(
      API_CONFIG.BASE_URL + `${API_CONFIG.CLUSTER.START}/${data.cluster_id}`,
      { type: "json", data: {} },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async stop(data: ClusterActionRequest): Promise<ClusterActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.post<ClusterActionResponse>(
      API_CONFIG.BASE_URL + `${API_CONFIG.CLUSTER.STOP}/${data.cluster_id}`,
      { type: "json", data: {} },
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },

  async delete(data: ClusterActionRequest): Promise<ClusterActionResponse> {
    const token = authHeaders();
    if (!token.Authorization) throw new Error("Token not found");
    const result = await client.delete<ClusterActionResponse>(
      API_CONFIG.BASE_URL + `${API_CONFIG.CLUSTER.DELETE}/${data.cluster_id}`,
      { headers: token },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
};
