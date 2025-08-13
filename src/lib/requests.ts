import { env } from "@/env";
import type {
  AssignUserToProjectRequest,
  ImageImportFromUrlRequest,
  LoginRequest,
  NetworkCreateRequest,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  RemoveUserFromProjectRequest,
  RouterAddInterfaceRequest,
  RouterCreateRequest,
  SwitchProjectRequest,
  UpdateUserRolesRequest,
  UserCreateRequest,
  UserUpdateRequest,
  VMCreateRequest,
} from "@/types/RequestInterfaces";
import type {
  AssignUserResponse,
  DashboardOverviewResponse,
  ImageImportFromUrlResponse,
  InstanceDetailsResponse,
  InstanceListResponse,
  LoginResponse,
  LogoutResponse,
  NetworkCreateResponse,
  NetworkDeleteResponse,
  NetworkListResponse,
  NovaActionResponse,
  ProjectDeleteResponse,
  ProjectDetailsResponse,
  ProjectListResponse,
  ProjectsResponse,
  RemoveUserResponse,
  ResourcesResponse,
  RolesResponse,
  RouterAddInterfaceResponse,
  RouterCreateResponse,
  UnassignedUsersResponse,
  UpdateUserRolesResponse,
  UserCreateResponse,
  UserDeleteResponse,
  UserDetailsResponse,
  UserListResponse,
  VMCreateResponse,
  VMwareImportResponse,
} from "@/types/ResponseInterfaces";
import { TFetchClient } from "@thatguyjamal/type-fetch";
import { getCookie } from "cookies-next";

const API_CONFIG = {
  BASE_URL: env.NEXT_PUBLIC_BACKEND ?? "http://127.0.0.1:8000/api/v1",
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
    IMPORT_VMWARE: "/nova/import-vmware-vm",
    START_INSTANCE: "/nova/start",
    STOP_INSTANCE: "/nova/stop",
    REBOOT_INSTANCE: "/nova/reboot",
    DELETE_INSTANCE: "/nova/delete",
    RESOURCES: "/nova/resources",
    OVERVIEW: "/dashboard/overview",
  },
  PROJECTS: {
    BASE: "/projects/",
    ASSIGN_USER: "/projects/assign-user",
    REMOVE_USER: "/projects/remove-user",
    UPDATE_USER_ROLES: "/projects/update-user-roles",
  },
  USERS: {
    BASE: "/users/users",
    ROLES: "/users/roles",
  },
  IMAGE: {
    IMPORT_FROM_URL: "/image/images/import-from-url",
  },
  NETWORK: {
    LIST: "/network/list",
    CREATE: "/network/networks/create",
    ROUTER_CREATE: "/network/router/create",
    ROUTER_ADD_INTERFACE: "/network/router/",
    DELETE: "/network/delete/",
  },
} as const;

const client = new TFetchClient();
const authHeaders = (): Record<string, string> => {
  const t = getCookie("token") as string;
  return t ? { Authorization: `Bearer ${t}` } : {};
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
    const result = await client.get<ProjectListResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.PROJECTS.BASE,
      { headers: { Accept: "application/json" } },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async listDetails(): Promise<ProjectDetailsResponse[]> {
    const projects = await this.list();
    if (projects.length === 0) return [];
    const settled = await Promise.allSettled(
      projects.map((p) => this.get(p.id)),
    );
    return settled
      .filter(
        (r): r is PromiseFulfilledResult<ProjectDetailsResponse> =>
          r.status === "fulfilled",
      )
      .map((r) => r.value);
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
      API_CONFIG.BASE_URL + API_CONFIG.PROJECTS.BASE + projectId,
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
        `${projectId}/unassigned_users`,
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
      API_CONFIG.BASE_URL + API_CONFIG.PROJECTS.ASSIGN_USER,
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
      API_CONFIG.BASE_URL + API_CONFIG.PROJECTS.REMOVE_USER,
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
      API_CONFIG.BASE_URL + API_CONFIG.PROJECTS.UPDATE_USER_ROLES,
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
      API_CONFIG.BASE_URL + API_CONFIG.PROJECTS.BASE + projectId,
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
      API_CONFIG.BASE_URL + API_CONFIG.PROJECTS.BASE + projectId,
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
    console.log(result.data);
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
};

export const ImageService = {
  async importFromUrl(
    params: ImageImportFromUrlRequest,
  ): Promise<ImageImportFromUrlResponse> {
    const url =
      API_CONFIG.BASE_URL +
      API_CONFIG.IMAGE.IMPORT_FROM_URL +
      `?image_url=${encodeURIComponent(params.image_url)}&image_name=${encodeURIComponent(params.image_name)}${params.visibility ? `&visibility=${params.visibility}` : ""}`;
    const result = await client.post<ImageImportFromUrlResponse>(url, {
      type: "json",
      data: {},
    });
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
};

export const NetworkService = {
  async list(): Promise<NetworkListResponse> {
    const result = await client.get<NetworkListResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.NETWORK.LIST,
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async create(data: NetworkCreateRequest): Promise<NetworkCreateResponse> {
    const result = await client.post<NetworkCreateResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.NETWORK.CREATE,
      { type: "json", data },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async createRouter(data: RouterCreateRequest): Promise<RouterCreateResponse> {
    const result = await client.post<RouterCreateResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.NETWORK.ROUTER_CREATE,
      { type: "json", data },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async addRouterInterface(
    routerId: string,
    data: RouterAddInterfaceRequest,
  ): Promise<RouterAddInterfaceResponse> {
    const result = await client.post<RouterAddInterfaceResponse>(
      API_CONFIG.BASE_URL +
        API_CONFIG.NETWORK.ROUTER_ADD_INTERFACE +
        `${routerId}/add-interface`,
      { type: "json", data },
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
  async delete(networkId: string): Promise<NetworkDeleteResponse> {
    const result = await client.delete<NetworkDeleteResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.NETWORK.DELETE + networkId,
    );
    if (result.error) throw new Error(result.error.message);
    return result.data!;
  },
};

export const InfraService = {
  async listInstances(): Promise<InstanceListResponse> {
    const result = await client.get<InstanceListResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.INSTANCES,
    );
    if (result.error) {
      throw new Error(`Error fetching instances: ${result.error.message}`);
    }
    if (!result.data) {
      throw new Error("No data received from instances endpoint");
    }
    return result.data;
  },

  async getInstanceDetails(
    instanceId: string,
  ): Promise<InstanceDetailsResponse> {
    const result = await client.get<InstanceDetailsResponse>(
      API_CONFIG.BASE_URL +
        API_CONFIG.INFRA.INSTANCE_DETAILS +
        `/${instanceId}`,
    );
    if (result.error) {
      throw new Error(
        `Error fetching instance details: ${result.error.message}`,
      );
    }
    if (!result.data) {
      throw new Error("No data received from instance details endpoint");
    }
    return result.data;
  },

  async createVM(vmData: VMCreateRequest): Promise<VMCreateResponse> {
    const result = await client.post<VMCreateResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.CREATE_VM,
      { type: "json", data: vmData },
    );
    if (result.error) {
      throw new Error(`Error creating VM: ${result.error.message}`);
    }
    if (!result.data) {
      throw new Error("No data received from create VM endpoint");
    }
    return result.data;
  },

  async importVMwareVM(formData: FormData): Promise<VMwareImportResponse> {
    const result = await client.post<VMwareImportResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.IMPORT_VMWARE,
      { type: "form", data: formData },
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
    const result = await client.get<ResourcesResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.RESOURCES,
    );
    if (result.error) {
      throw new Error(`Error fetching resources: ${result.error.message}`);
    }
    if (!result.data) {
      throw new Error("No data received from resources endpoint");
    }
    return result.data;
  },

  async startInstance(instanceId: string): Promise<NovaActionResponse> {
    const result = await client.post<NovaActionResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.START_INSTANCE + `/${instanceId}`,
      { type: "json", data: {} },
    );
    if (result.error) {
      throw new Error(`Error starting instance: ${result.error.message}`);
    }
    if (!result.data) {
      throw new Error("No data received from start instance endpoint");
    }
    return result.data;
  },

  async stopInstance(instanceId: string): Promise<NovaActionResponse> {
    const result = await client.post<NovaActionResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.STOP_INSTANCE + `/${instanceId}`,
      { type: "json", data: {} },
    );
    if (result.error) {
      throw new Error(`Error stopping instance: ${result.error.message}`);
    }
    if (!result.data) {
      throw new Error("No data received from stop instance endpoint");
    }
    return result.data;
  },

  async rebootInstance(instanceId: string): Promise<NovaActionResponse> {
    const result = await client.post<NovaActionResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.REBOOT_INSTANCE + `/${instanceId}`,
      { type: "json", data: {} },
    );
    if (result.error) {
      throw new Error(`Error rebooting instance: ${result.error.message}`);
    }
    if (!result.data) {
      throw new Error("No data received from reboot instance endpoint");
    }
    return result.data;
  },

  async deleteInstance(instanceId: string): Promise<NovaActionResponse> {
    const result = await client.delete<NovaActionResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.DELETE_INSTANCE + `/${instanceId}`,
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
    const result = await client.get<DashboardOverviewResponse>(
      API_CONFIG.BASE_URL + API_CONFIG.INFRA.OVERVIEW,
    );
    if (result.error) {
      throw new Error(`Error fetching overview: ${result.error.message}`);
    }
    if (!result.data) {
      throw new Error("No data received from overview endpoint");
    }
    return result.data;
  },
};
