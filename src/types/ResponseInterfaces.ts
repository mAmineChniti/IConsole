export type InstanceStatus =
  | "ACTIVE"
  | "SHUTOFF"
  | "ERROR"
  | "BUILD"
  | "DELETED";

export type ImageStatus = "active" | "queued" | "saving";

type ServiceStatus = "enabled" | "disabled";
type ServiceState = "up" | "down";

export interface LoginResponse {
  token: string;
  projects: ProjectInfo[];
  message: string;
}

export interface ProjectInfo {
  project_id: string;
  project_name: string;
  roles: string[];
}

export interface ProjectsResponse {
  projects: ProjectInfo[];
}

export interface LogoutResponse {
  message: string;
}

export interface InstanceListItem {
  instance_name: string;
  image_name: string;
  ip_address: string;
  flavor: string;
  key_pair: string;
  status: string;
  availability_zone: string;
  task: string;
  power_state: string;
  age: string;
  id: string;
}

export type InstanceListResponse = InstanceListItem[];

export interface NovaActionResponse {
  message: string;
}

export interface FlavorDetails {
  name: string;
  ram: string;
  vcpus: number;
  disk: string;
}

export interface ImageDetails {
  name: string;
  id: string;
}

export interface NetworkDetails {
  network: string;
  ip: string;
  type: string;
}

export interface VolumeDetails {
  id: string;
  name: string;
  size: string;
}

export interface InstanceDetailsResponse {
  id: string;
  name: string;
  status: string;
  locked: boolean;
  project_id: string;
  created_at: string;
  host: string;
  flavor: FlavorDetails;
  image: ImageDetails;
  networks: NetworkDetails[];
  security_groups: string[];
  volumes: VolumeDetails[];
  floating_ips: string[];
}

export interface VMCreateResponse {
  status: "success";
  server: {
    id: string;
    name: string;
    status: string;
    admin_username: string;
    admin_password: string;
    ssh_key: string;
    floating_ip: string;
  };
}

export interface VMwareImportResponse {
  status: "success";
  image: {
    id: string;
    name: string;
  };
  server: {
    id: string;
    name: string;
    status: string;
    floating_ip: string;
  };
}

export interface CreateFromDescriptionResponse {
  status: "success";
  server_id: string;
  server_name: string;
  image_source: string;
  flavor: string;
  networks: NetworkReference[];
  security_groups: string[];
  admin_username: string;
  admin_password: string;
  floating_ip: string;
}

export interface NetworkReference {
  uuid: string;
}

export interface ResourceFlavor {
  id: string;
  name: string;
  ram: number;
  vcpus: number;
  disk: number;
  ephemeral: number;
  swap: number;
  is_public: boolean;
  extra_specs: Record<string, unknown>;
}

export interface ResourceImage {
  id: string;
  name: string;
}

export interface ResourceNetwork {
  id: string;
  name: string;
}

export interface ResourceKeypair {
  name: string;
}

export interface ResourceSecurityGroup {
  name: string;
}

export interface ResourcesResponse {
  images: ResourceImage[];
  flavors: ResourceFlavor[];
  networks: ResourceNetwork[];
  keypairs: ResourceKeypair[];
  security_groups: ResourceSecurityGroup[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  domain_id: string;
  enabled: boolean;
  user_count: number;
}

export type ProjectListResponse = Project[];

export interface ProjectDetailsResponse extends Project {
  assignments: UserAssignment[];
}

export interface UserAssignment {
  user_id: string;
  user_name: string;
  roles: UserRole[];
}

export interface UserRole {
  role_id: string;
  role_name: string;
}

export interface UnassignedUser {
  user_id: string;
  user_name: string;
}

export type UnassignedUsersResponse = UnassignedUser[];

export interface AssignUserResponse {
  message: string;
  user_id: string;
  project_id: string;
  roles_assigned: string[];
}

export interface RemoveUserResponse {
  message: string;
  user_id: string;
  project_id: string;
  roles_removed: string[];
}

export interface UpdateUserRolesResponse {
  message: string;
  user_id: string;
  project_id: string;
  roles_assigned: string[];
}

export interface ProjectDeleteResponse {
  message: string;
}

export interface UserCreateResponse {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  project: string;
  domain: string;
  email: string;
  enabled: boolean;
}

export type UserListResponse = User[];

export interface UserDetailsResponse {
  id: string;
  name: string;
  email: string;
  enabled: boolean;
  default_project_id: string;
  projects: ProjectInfo[];
}

export interface UserDeleteResponse {
  message: string;
}

export interface Role {
  id: string;
  name: string;
}

export type RolesResponse = Role[];

export interface ImageImportFromUrlResponse {
  message: string;
  image_id: string;
  format: string;
}

interface Image {
  id: string;
  name: string;
  status: ImageStatus;
}

export type ImageListResponse = Image[];

interface Instance {
  id: string;
  name: string;
  status: InstanceStatus;
}

export type NovaInstancesResponse = Instance[];

interface PlatformInfo {
  nodes: number;
  projects: number;
  users: number;
  hypervisor_errors: string[];
}

interface InstanceResources {
  total: number;
  ACTIVE: number;
  SHUTOFF: number;
  ERROR: number;
  OTHERS: number;
}

interface VolumeResources {
  total: number;
  available: number;
  "in-use": number;
  error?: number;
  OTHERS: number;
}

interface CpuResources {
  used: number;
  total: number;
  unused: number;
  usage_percent: number;
  note?: string;
}

interface RamResources {
  used: number;
  total: number;
  unused: number;
  usage_percent: number;
  note?: string;
}

interface Resources {
  instances: InstanceResources;
  volumes: VolumeResources;
  cpu: CpuResources;
  ram: RamResources;
}

interface ComputeService {
  name: string;
  host: string;
  status: ServiceStatus;
  state: ServiceState;
}

interface NetworkService {
  name: string;
  host: string;
  alive: boolean;
}

export interface DashboardOverviewResponse {
  platform_info: PlatformInfo;
  resources: Resources;
  compute_services: ComputeService[];
  network_services: NetworkService[];
}

export interface NetworkListItem {
  id: string;
  name: string;
  status: string;
  is_external: boolean;
  shared: boolean;
  subnets: string[];
}

export type NetworkListResponse = NetworkListItem[];

export interface NetworkCreateResponse {
  message: string;
}

export interface RouterCreateResponse {
  id: string;
  name: string;
}

export interface RouterAddInterfaceResponse {
  message: string;
}

export interface NetworkDeleteResponse {
  message: string;
}
