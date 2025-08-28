export interface ErrorResponse {
  detail: string;
}

type ServiceStatus = "enabled" | "disabled";
type ServiceState = "up" | "down";

interface ProjectInfo {
  project_id: string;
  project_name: string;
  roles: string[];
}

interface NetworkReference {
  uuid: string;
}

export interface LoginResponse {
  token: string;
  user_id: string;
  username: string;
  projects: ProjectInfo[];
  expires_at: string;
  expires_at_ts: number;
  message: string;
}

export interface ProjectsResponse {
  projects: ProjectInfo[];
}

export interface LogoutResponse {
  message: string;
}

export interface VolumeDetails {
  ID: string;
  Name: string;
  Description: string;
  Size: string;
  Status: string;
  Group: string;
  Type: string;
  "Attached To": string;
  "Availability Zone": string;
  Bootable: string;
  Encrypted: string;
}

export type VolumeListResponse = VolumeDetails[];

export interface VolumeGetDetails {
  Nom: string;
  ID: string;
  Description: string;
  Projet: string;
  Statut: string;
  Groupe: string;
  Spécifications: {
    Taille: string;
    Type: string;
    Amorçable: string;
    Chiffré: string;
    Créé: string;
  };
  Attachements: {
    "Attaché à": string;
  };
  Métadonnées: Record<string, unknown> | string;
}

export interface VolumeActionResponse {
  message: string;
  [key: string]: unknown;
}

export interface VolumeAvailableInstancesResponse {
  volume_id: string;
  volume_name: string;
  available_instances: Array<{
    id: string;
    name: string;
    status: string;
  }>;
}

export interface VolumeAttachedInstancesResponse {
  volume_id: string;
  volume_name: string;
  attached_instances: Array<{
    id: string;
    name: string;
    status: string;
    device: string;
  }>;
}

export interface VolumeAttachmentsDetailsResponse {
  volume_id: string;
  volume_name: string;
  attachments: Array<{
    attachment_id: string;
    server_id: string;
    server_name: string;
    device: string;
    host: string;
    attached_at: string;
  }>;
}

export interface VolumeSnapshot {
  ID: string;
  Name: string;
  Description: string;
  "Volume Name": string;
  Status: string;
  Size: string;
}

export type VolumeSnapshotListResponse = VolumeSnapshot[];

export interface VolumeSnapshotDetails {
  ID: string;
  Name: string;
  Description: string;
  "Project Name": string;
  Status: string;
  "Volume ID": string;
  "Volume Name": string;
  "Group Snapshot": string;
  Size: string;
  Created: string;
  Metadata: Record<string, unknown>;
}

export interface VolumeType {
  ID: string;
  Name: string;
  Description: string;
  Is_Public: boolean;
}

export type VolumeTypeListResponse = VolumeType[];

export interface FlavorDetails {
  id: string;
  name: string;
  ram: number;
  vcpus: number;
  disk: number;
  ephemeral_disk: number;
  swap: number;
  rxtx_factor: number;
  public: boolean;
  disabled: boolean;
}

export interface FlavorGetDetails {
  id: string;
  name: string;
  ram: number;
  vcpus: number;
  disk: number;
  ephemeral_disk: number;
  swap: number;
  rxtx_factor: number;
  public: boolean;
  disabled: boolean;
}

export type FlavorListResponse = FlavorDetails[];

export interface FlavorActionResponse {
  message: string;
  status: string;
}

export interface ImageDetails {
  id: string;
  name: string;
  status: string;
  visibility: "public" | "private" | "shared" | "community";
  protected: boolean;
  size?: string;
  disk_format?: string;
  container_format?: string;
  created?: string;
  updated?: string;
}

export type ImageListResponse = ImageDetails[];

export interface ImageDeleteResponse {
  message: string;
}

export interface ImageImportFromUploadResponse {
  message: string;
  image_id: string;
  format: string;
}

export interface ImageImportFromUrlResponse {
  message: string;
  image_id: string;
  format: string;
}

export interface ImageImportFromNameResponse
  extends ImageImportFromUrlResponse {
  source_url: string;
}

export interface InstanceListItem {
  id: string;
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
  floating_ip: string;
  has_volume: boolean;
}

export type InstanceListResponse = InstanceListItem[];

export interface NetworkDetails {
  network: string;
  ip: string;
  type: string;
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

export interface NovaActionResponse {
  message: string;
}

interface ResourceFlavor {
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

interface ResourceImage {
  id: string;
  name: string;
}

interface ResourceNetwork {
  id: string;
  name: string;
}

interface ResourceKeypair {
  name: string;
}

interface ResourceSecurityGroup {
  name: string;
}

export interface ResourcesResponse {
  images: ResourceImage[];
  flavors: ResourceFlavor[];
  networks: ResourceNetwork[];
  keypairs: ResourceKeypair[];
  security_groups: ResourceSecurityGroup[];
}

export interface QemuImgCheckResponse {
  installed: boolean;
  version?: string;
}

export interface SecurityGroup {
  Name: string;
  "Security Group ID": string;
  Description: string;
  Shared: boolean;
}

export type SecurityGroupListResponse = SecurityGroup[];

export interface SecurityGroupCreateResponse {
  id: string;
  name: string;
  description: string;
  project_id?: string;
}

export interface SecurityGroupDeleteResponse {
  message: string;
}

export interface SecurityGroupRule {
  ID: string;
  Direction: string;
  "Ether Type": string;
  "IP Protocol": string;
  "Port Range": string;
  "Remote IP Prefix": string;
  "Remote Security Group": string;
  Description: string;
}

export type SecurityGroupRuleListResponse = {
  "Security Group": string;
  "Security Group ID": string;
  Rules: SecurityGroupRule[];
};

export interface SecurityGroupRuleCreateResponse {
  id: string;
  security_group_id: string;
  message?: string;
}

export interface SecurityGroupRuleDeleteResponse {
  message: string;
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

interface UnassignedUser {
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

export interface DebugRoleAssignmentsResponse {
  user_id: string;
  assignments: Array<{
    project_id: string;
    project_name?: string;
    roles: string[];
  }>;
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

interface PlatformInfo {
  nodes: number;
  projects: number;
  users: number;
  hypervisor_errors: string[];
}

interface InstanceResources {
  total: number;
  ACTIVE: number;
  OTHERS: number;
}

interface VolumeResources {
  total: number;
  available: number;
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

export interface ScaleHealthResponse {
  status: string;
}

export interface ScaleNodeResponse {
  message: string;
  hostname: string;
  ip: string;
  deploy_tag: string;
  logs?: string;
}

export interface SecurityGroupActionResponse {
  message: string;
  status: string;
}

export interface KeyPairs {
  name: string;
  type: string;
}

export type KeyPairListResponse = KeyPairs[];

export interface KeyPairDetails {
  name: string;
  type: string;
  fingerprint: string;
  public_key: string;
}

export interface KeyPairCreateResponse {
  message: string;
  keypair: KeyPairs;
  private_key?: string;
}

export interface KeyPairImportResponse {
  message: string;
  keypair: KeyPairs;
}

export interface KeyPairDeleteResponse {
  message: string;
  status: string;
}

// Cluster responses (schemas not explicitly defined in OpenAPI; keep generic)
export interface ClusterActionResponse {
  message?: string;
  [key: string]: unknown;
}

export interface ClusterListResponse {
  clusters: Clusters[];
}

export interface Clusters {
  cluster_id: number;
  cluster_name: string;
  overall_status: string;
  created_at: string | null;
  master_count: number;
  worker_count: number;
}

export interface ClusterDetails {
  cluster_id: number;
  cluster_name: string;
  nodes: NodeInfo[];
  created_at: string | null;
  overall_status: string;
}

export interface NodeInfo {
  id: string;
  name: string;
  role: string;
  status: string;
  ssh_key: string;
  floating_ip: string;
}

export interface ClusterDashboardTokenResponse {
  cluster_id: number;
  master_ip: string;
  token: string;
  dashboard_path: string;
  kubeconfig: string;
}
