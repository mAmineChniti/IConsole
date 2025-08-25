// ============================================================================
// COMMON TYPES AND UTILITIES
// ============================================================================

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

// ============================================================================
// AUTHENTICATION SERVICE
// ============================================================================

// POST /api/v1/auth/login
export interface LoginResponse {
  token: string;
  user_id: string;
  username: string;
  projects: ProjectInfo[];
  expires_at: string;
  expires_at_ts: number;
  message: string;
}

// GET /api/v1/auth/projects
export interface ProjectsResponse {
  projects: ProjectInfo[];
}

// POST /api/v1/auth/logout
export interface LogoutResponse {
  message: string;
}

// ============================================================================
// VOLUME SERVICE
// ============================================================================

// GET /api/v1/volume/volumes
// Matches backend payload with localized keys
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

// GET /api/v1/volume/volumes/{volume_id}
// Matches backend payload with localized keys
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

// POST /api/v1/volume/volumes (create, attach, detach, extend, etc.)
export interface VolumeActionResponse {
  message: string;
  [key: string]: unknown;
}

// GET /api/v1/volume/volumes/{volume_id}/available-instances
export interface VolumeAvailableInstancesResponse {
  volume_id: string;
  volume_name: string;
  available_instances: Array<{
    id: string;
    name: string;
    status: string;
  }>;
}

// GET /api/v1/volume/volumes/{volume_id}/attached-instances
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

// GET /api/v1/volume/volumes/{volume_id}/attachments-details
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

// GET /api/v1/volume/snapshots
export interface VolumeSnapshot {
  id: string;
  name: string;
  description: string;
  volume_name?: string;
  status: string;
  size: number;
  [key: string]: unknown;
}

export type VolumeSnapshotListResponse = VolumeSnapshot[];

// GET /api/v1/volume/snapshots/{snapshot_id}
export interface VolumeSnapshotDetails {
  id: string;
  name: string;
  description: string;
  project_name: string;
  status: string;
  volume_id: string;
  volume_name: string;
  group_snapshot: string;
  size: number;
  created: string;
  metadata: Record<string, unknown>;
}

// GET /api/v1/volume-types/list
// Matches backend payload with capitalized keys
export interface VolumeType {
  ID: string;
  Name: string;
  Description: string;
  Is_Public: boolean;
}

export type VolumeTypeListResponse = VolumeType[];

// ============================================================================
// FLAVOR SERVICE
// ============================================================================

// GET /api/v1/flavor/flavors
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

// GET /flavor/flavors/{flavor_id}
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

// Flavor action response
export interface FlavorActionResponse {
  message: string;
  status: string;
}

// ============================================================================
// IMAGE SERVICE
// ============================================================================

// GET /api/v1/image/images
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

// DELETE /api/v1/image/images/{image_id}
export interface ImageDeleteResponse {
  message: string;
}

// POST /api/v1/image/images/import-from-upload
export interface ImageImportFromUploadResponse {
  message: string;
  image_id: string;
  format: string;
}

// POST /api/v1/image/images/import-from-url
export interface ImageImportFromUrlResponse {
  message: string;
  image_id: string;
  format: string;
}

// POST /api/v1/image/images/import-from-name
export interface ImageImportFromNameResponse
  extends ImageImportFromUrlResponse {
  source_url: string;
}

// ============================================================================
// NOVA/COMPUTE SERVICE
// ============================================================================

// GET /api/v1/nova/instances
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
}

export type InstanceListResponse = InstanceListItem[];

// GET /api/v1/nova/servers/{server_id}
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

// POST /api/v1/nova/create-vm
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

// POST /api/v1/nova/create-from-description
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

// POST /api/v1/nova/import-vmware-vm
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

// POST /api/v1/nova/start, /api/v1/nova/stop, /api/v1/nova/reboot, /api/v1/nova/delete
export interface NovaActionResponse {
  message: string;
}

// GET /api/v1/nova/resources
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

// GET /api/v1/nova/check-qemu-img
export interface QemuImgCheckResponse {
  installed: boolean;
  version?: string;
}

// ============================================================================
// SECURITY GROUP SERVICE
// ============================================================================

// GET /api/v1/securitygroups/security-groups
export interface SecurityGroup {
  id: string;
  name: string;
  description: string;
  project_id?: string;
  rules?: SecurityGroupRule[];
}

export type SecurityGroupListResponse = SecurityGroup[];

// POST /api/v1/securitygroups/security-groups
export interface SecurityGroupCreateResponse {
  id: string;
  name: string;
  description: string;
  project_id?: string;
}

// DELETE /api/v1/securitygroups/security-groups/{security_group_id}
export interface SecurityGroupDeleteResponse {
  message: string;
}

// GET /api/v1/securitygroups/security-groups/{security_group_id}/rules
export interface SecurityGroupRule {
  id: string;
  direction: "ingress" | "egress";
  ethertype: "IPv4" | "IPv6";
  protocol?: string;
  port_range_min?: number;
  port_range_max?: number;
  remote_ip_prefix?: string;
  remote_group_id?: string;
  security_group_id: string;
  description?: string;
}

export type SecurityGroupRuleListResponse = SecurityGroupRule[];

// POST /api/v1/securitygroups/security-groups/{security_group_id}/rules
export interface SecurityGroupRuleCreateResponse {
  id: string;
  security_group_id: string;
  message?: string;
}

// DELETE /api/v1/securitygroups/security-groups/rules/{rule_id}
export interface SecurityGroupRuleDeleteResponse {
  message: string;
}

// ============================================================================
// PROJECT SERVICE
// ============================================================================

// GET /api/v1/projects
export interface Project {
  id: string;
  name: string;
  description: string;
  domain_id: string;
  enabled: boolean;
  user_count: number;
}

export type ProjectListResponse = Project[];

// GET /api/v1/projects/{project_id}
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

// GET /api/v1/projects/{project_id}/unassigned_users
interface UnassignedUser {
  user_id: string;
  user_name: string;
}

export type UnassignedUsersResponse = UnassignedUser[];

// POST /api/v1/projects/assign-user
export interface AssignUserResponse {
  message: string;
  user_id: string;
  project_id: string;
  roles_assigned: string[];
}

// POST /api/v1/projects/remove-user
export interface RemoveUserResponse {
  message: string;
  user_id: string;
  project_id: string;
  roles_removed: string[];
}

// PUT /api/v1/projects/update-user-roles
export interface UpdateUserRolesResponse {
  message: string;
  user_id: string;
  project_id: string;
  roles_assigned: string[];
}

// DELETE /api/v1/projects/{project_id}
export interface ProjectDeleteResponse {
  message: string;
}

// ============================================================================
// USER SERVICE
// ============================================================================

// POST /api/v1/users/users
export interface UserCreateResponse {
  id: string;
  name: string;
}

// GET /api/v1/users/users
export interface User {
  id: string;
  name: string;
  project: string;
  domain: string;
  email: string;
  enabled: boolean;
}

export type UserListResponse = User[];

// GET /api/v1/users/users/{user_id}
export interface UserDetailsResponse {
  id: string;
  name: string;
  email: string;
  enabled: boolean;
  default_project_id: string;
  projects: ProjectInfo[];
}

// DELETE /api/v1/users/users/{user_id}
export interface UserDeleteResponse {
  message: string;
}

// GET /api/v1/users/roles
export interface Role {
  id: string;
  name: string;
}

export type RolesResponse = Role[];

// GET /api/v1/users/debug_role_assignments/{user_id}
export interface DebugRoleAssignmentsResponse {
  user_id: string;
  assignments: Array<{
    project_id: string;
    project_name?: string;
    roles: string[];
  }>;
}

// ============================================================================
// NETWORK SERVICE
// ============================================================================

// GET /api/v1/network/list
export interface NetworkListItem {
  id: string;
  name: string;
  status: string;
  is_external: boolean;
  shared: boolean;
  subnets: string[];
}

export type NetworkListResponse = NetworkListItem[];

// POST /api/v1/network/networks/create
export interface NetworkCreateResponse {
  message: string;
}

// POST /api/v1/network/router/create
export interface RouterCreateResponse {
  id: string;
  name: string;
}

// POST /api/v1/network/router/{router_id}/add-interface
export interface RouterAddInterfaceResponse {
  message: string;
}

// DELETE /api/v1/network/delete/{network_id}
export interface NetworkDeleteResponse {
  message: string;
}

// ============================================================================
// DASHBOARD SERVICE
// ============================================================================

// GET /api/v1/dashboard/overview
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

// ============================================================================
// SCALE SERVICE
// ============================================================================

// GET /api/v1/scale/{health_endpoint}
export interface ScaleHealthResponse {
  status: string;
}

// POST /api/v1/scale/node
export interface ScaleNodeResponse {
  message: string;
  hostname: string;
  ip: string;
  deploy_tag: string;
  logs?: string;
}

// ============================================================================
// SECURITY GROUP SERVICE
// ============================================================================

export interface SecurityGroupActionResponse {
  message: string;
  status: string;
}

// ============================================================================
// KEYPAIRS SERVICE
// ============================================================================

// GET /keypairs/keypairs
export interface KeyPairDetails {
  name: string;
  type: string;
  fingerprint: string;
  public_key: string;
  user_id: string;
}

export type KeyPairListResponse = KeyPairDetails[];

// POST /keypairs/keypairs/create
export interface KeyPairCreateResponse {
  message: string;
  keypair: KeyPairDetails;
  private_key?: string;
}

// POST /keypairs/keypairs/import-from-file
export interface KeyPairImportResponse {
  message: string;
  keypair: KeyPairDetails;
}

// DELETE /keypairs/keypairs/{name}
export interface KeyPairDeleteResponse {
  message: string;
  status: string;
}
